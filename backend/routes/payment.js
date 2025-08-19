import express from 'express';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Initialize Intouch payment
router.post('/intouch/init', protect, async (req, res) => {
  try {
    const { eventId, quantity = 1 } = req.body;

    // Validate required environment variables
    const requiredEnvVars = ['INTOUCH_CLIENT_ID', 'INTOUCH_CLIENT_SECRET', 'INTOUCH_COMPANY_NAME', 'FRONTEND_URL'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      console.error('Missing environment variables:', missingEnvVars);
      return res.status(500).json({
        success: false,
        message: 'Configuration de paiement incomplète',
        error: 'Variables d\'environnement manquantes'
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

    // Generate unique reference
    const reference = `KZ-${ticket.ticketNumber}-${Date.now()}`;

    res.json({
      success: true,
      message: 'Paiement initialisé avec succès',
      data: {
        reference,
        amount: totalAmount,
        ticketId: ticket._id,
        clientId: process.env.INTOUCH_CLIENT_ID,
        clientSecret: process.env.INTOUCH_CLIENT_SECRET,
        companyName: process.env.INTOUCH_COMPANY_NAME,
        currency: 'XOF',
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        customerPhone: user.phone,
        description: `Billet(s) pour ${event.title}`,
        returnUrl: `${process.env.FRONTEND_URL}/payment/callback?ticketId=${ticket._id}&reference=${reference}`,
        cancelUrl: `${process.env.FRONTEND_URL}/events/${eventId}`
      }
    });
  } catch (error) {
    console.error('Init payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initialisation du paiement',
      error: error.message
    });
  }
});

// Handle payment callback
router.post('/intouch/callback', async (req, res) => {
  try {
    const { reference, status, transactionId, ticketId } = req.body;

    console.log('Payment callback received:', req.body);

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'ID de billet manquant'
      });
    }

    const ticket = await Ticket.findById(ticketId)
      .populate([
        { path: 'event', select: 'title date time location address image availableTickets' },
        { path: 'user', select: 'firstName lastName email phone' }
      ]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Billet non trouvé'
      });
    }

    // Update ticket based on payment status
    if (status === 'success' || status === 'completed') {
      ticket.paymentStatus = 'completed';
      ticket.paymentReference = transactionId || reference;
      
      // Generate QR code
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
        const { sendTicketEmail } = await import('../services/emailService.js');
        await sendTicketEmail(ticket);
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }

      res.json({
        success: true,
        message: 'Paiement confirmé avec succès',
        data: ticket
      });
    } else {
      ticket.paymentStatus = 'failed';
      ticket.paymentReference = transactionId || reference;
      await ticket.save();

      res.status(400).json({
        success: false,
        message: 'Échec du paiement',
        data: ticket
      });
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du callback de paiement'
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

export default router;