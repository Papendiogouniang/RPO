import express from 'express';
import axios from 'axios';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendTicketEmail } from '../services/emailService.js';

const router = express.Router();

// Initialize Intouch payment
router.post('/intouch/init', protect, async (req, res) => {
  try {
    const { eventId, quantity = 1 } = req.body;

    // Validate required environment variables
    const requiredEnvVars = [
      'INTOUCH_AGENCY_CODE',
      'INTOUCH_PARTNER_ID', 
      'INTOUCH_LOGIN_API',
      'INTOUCH_PASSWORD_API',
      'FRONTEND_URL'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      console.error('Missing environment variables:', missingEnvVars);
      return res.status(500).json({
        success: false,
        message: 'Configuration de paiement incomplète',
        error: 'Variables d\'environnement manquantes: ' + missingEnvVars.join(', ')
      });
    }

    // Validate input
    if (!eventId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides'
      });
    }

    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé ou inactif'
      });
    }

    if (event.availableTickets < quantity) {
      return res.status(400).json({
        success: false,
        message: `Billets non disponibles. Seulement ${event.availableTickets} places restantes.`
      });
    }

    const totalAmount = event.price * quantity;
    
    // Get user details for payment
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Check if user has complete profile
    if (!user.firstName || !user.lastName || !user.email || !user.phone) {
      return res.status(400).json({
        success: false,
        message: 'Profil utilisateur incomplet. Veuillez compléter vos informations.'
      });
    }

    // Create a pending ticket
    const ticket = await Ticket.create({
      event: eventId,
      user: req.user.id,
      quantity,
      totalAmount,
      paymentStatus: 'pending'
    });

    // Generate unique partner transaction ID
    const partnerTransactionId = `KZ-${ticket.ticketNumber}-${Date.now()}`;

    // Prepare InTouch payment request
    const intouchPayload = {
      service_id: "SN_Payment_OrangeMoney", // Default to Orange Money, can be made configurable
      recipient_phone_number: user.phone.replace(/\D/g, ''), // Remove non-digits
      amount: totalAmount,
      partner_id: process.env.INTOUCH_PARTNER_ID,
      partner_transaction_id: partnerTransactionId,
      login_api: process.env.INTOUCH_LOGIN_API,
      password_api: process.env.INTOUCH_PASSWORD_API,
      call_back_url: `${process.env.FRONTEND_URL.replace('5173', '5000')}/api/payment/intouch/callback`
    };

    console.log('InTouch payment request:', {
      ...intouchPayload,
      password_api: '***hidden***'
    });

    // Make request to InTouch API
    const intouchUrl = `https://apidist.gutouch.net/apidist/sec/${process.env.INTOUCH_AGENCY_CODE}/cashin`;
    
    try {
      const intouchResponse = await axios.post(intouchUrl, intouchPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log('InTouch response:', intouchResponse.data);

      // Update ticket with InTouch transaction reference
      ticket.paymentReference = partnerTransactionId;
      await ticket.save();

      // Return success response with payment details
      res.json({
        success: true,
        message: 'Paiement initialisé avec succès',
        data: {
          ticketId: ticket._id,
          ticketNumber: ticket.ticketNumber,
          partnerTransactionId,
          amount: totalAmount,
          customerPhone: user.phone,
          intouchResponse: intouchResponse.data,
          instructions: 'Veuillez suivre les instructions sur votre téléphone pour compléter le paiement.'
        }
      });

    } catch (intouchError) {
      console.error('InTouch API error:', intouchError.response?.data || intouchError.message);
      
      // Update ticket status to failed
      ticket.paymentStatus = 'failed';
      await ticket.save();

      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'initialisation du paiement mobile',
        error: intouchError.response?.data?.message || intouchError.message
      });
    }

  } catch (error) {
    console.error('Init payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initialisation du paiement',
      error: error.message
    });
  }
});

// Handle payment callback from InTouch
router.post('/intouch/callback', async (req, res) => {
  try {
    console.log('InTouch callback received:', req.body);

    const { 
      partner_transaction_id,
      transaction_id,
      status,
      amount,
      recipient_phone_number,
      service_id,
      message
    } = req.body;

    if (!partner_transaction_id) {
      console.error('Missing partner_transaction_id in callback');
      return res.status(400).json({
        success: false,
        message: 'ID de transaction partenaire manquant'
      });
    }

    // Find ticket by partner transaction ID
    const ticket = await Ticket.findOne({ 
      paymentReference: partner_transaction_id 
    }).populate([
      { path: 'event', select: 'title date time location address image availableTickets' },
      { path: 'user', select: 'firstName lastName email phone' }
    ]);

    if (!ticket) {
      console.error('Ticket not found for transaction:', partner_transaction_id);
      return res.status(404).json({
        success: false,
        message: 'Billet non trouvé pour cette transaction'
      });
    }

    // Update ticket based on payment status
    if (status === 'SUCCESS' || status === 'COMPLETED') {
      ticket.paymentStatus = 'completed';
      ticket.paymentReference = transaction_id || partner_transaction_id;
      
      // Generate QR code
      try {
        const QRCode = await import('qrcode');
        const qrData = {
          ticketId: ticket._id,
          ticketNumber: ticket.ticketNumber,
          eventId: ticket.event._id,
          userId: ticket.user._id
        };

        ticket.qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
        await ticket.save();

        // Update event available tickets
        const event = await Event.findById(ticket.event._id);
        if (event) {
          event.availableTickets = Math.max(0, event.availableTickets - ticket.quantity);
          await event.save();
        }

        // Send ticket email
        try {
          await sendTicketEmail(ticket);
          console.log('Ticket email sent successfully');
        } catch (emailError) {
          console.error('Email send error:', emailError);
        }

        res.json({
          success: true,
          message: 'Paiement confirmé avec succès',
          data: {
            ticketId: ticket._id,
            ticketNumber: ticket.ticketNumber,
            status: 'completed'
          }
        });

      } catch (qrError) {
        console.error('QR code generation error:', qrError);
        // Still mark as completed even if QR fails
        await ticket.save();
        
        res.json({
          success: true,
          message: 'Paiement confirmé (QR code sera généré ultérieurement)',
          data: {
            ticketId: ticket._id,
            ticketNumber: ticket.ticketNumber,
            status: 'completed'
          }
        });
      }

    } else {
      // Payment failed
      ticket.paymentStatus = 'failed';
      ticket.notes = message || 'Paiement échoué';
      await ticket.save();

      res.json({
        success: false,
        message: 'Paiement échoué',
        data: {
          ticketId: ticket._id,
          ticketNumber: ticket.ticketNumber,
          status: 'failed',
          reason: message
        }
      });
    }

  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du callback de paiement',
      error: error.message
    });
  }
});

// Get payment status
router.get('/status/:ticketId', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId)
      .populate('event', 'title date time location')
      .populate('user', 'firstName lastName email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Billet non trouvé'
      });
    }

    // Check if user owns the ticket or is admin
    if (ticket.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    res.json({
      success: true,
      data: {
        paymentStatus: ticket.paymentStatus,
        paymentReference: ticket.paymentReference,
        ticket
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du statut de paiement'
    });
  }
});

// Check transaction status manually (for debugging)
router.get('/check/:partnerTransactionId', protect, async (req, res) => {
  try {
    const { partnerTransactionId } = req.params;
    
    const ticket = await Ticket.findOne({ 
      paymentReference: partnerTransactionId 
    }).populate([
      { path: 'event', select: 'title date time location' },
      { path: 'user', select: 'firstName lastName email' }
    ]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée'
      });
    }

    res.json({
      success: true,
      data: {
        ticket,
        status: ticket.paymentStatus,
        reference: ticket.paymentReference
      }
    });

  } catch (error) {
    console.error('Check transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de la transaction'
    });
  }
});

export default router;