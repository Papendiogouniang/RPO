import express from 'express';
import QRCode from 'qrcode';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { sendTicketEmail } from '../services/emailService.js';

const router = express.Router();

// Get user tickets
router.get('/my-tickets', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate('event', 'title date time location image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des billets'
    });
  }
});

// Get all tickets (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, eventId } = req.query;
    
    const query = {};
    
    if (status) {
      query.paymentStatus = status;
    }
    
    if (eventId) {
      query.event = eventId;
    }

    const tickets = await Ticket.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('event', 'title date time location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ticket.countDocuments(query);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des billets'
    });
  }
});

// Create ticket (after payment)
router.post('/', protect, async (req, res) => {
  try {
    const { eventId, quantity = 1, paymentReference } = req.body;

    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    if (event.availableTickets < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Billets non disponibles en quantité suffisante'
      });
    }

    const totalAmount = event.price * quantity;

    const ticket = await Ticket.create({
      event: eventId,
      user: req.user.id,
      quantity,
      totalAmount,
      paymentReference,
      paymentStatus: 'pending'
    });

    // Generate QR code
    const qrData = {
      ticketId: ticket._id,
      ticketNumber: ticket.ticketNumber,
      eventId: eventId,
      userId: req.user.id
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
    ticket.qrCode = qrCode;
    await ticket.save();

    // Update available tickets
    event.availableTickets -= quantity;
    await event.save();

    await ticket.populate([
      { path: 'event', select: 'title date time location address image' },
      { path: 'user', select: 'firstName lastName email phone' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Billet créé avec succès',
      data: ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du billet'
    });
  }
});

// Update ticket payment status
router.patch('/:id/payment', protect, async (req, res) => {
  try {
    const { status, reference } = req.body;
    
    const ticket = await Ticket.findById(req.params.id)
      .populate([
        { path: 'event', select: 'title date time location address image' },
        { path: 'user', select: 'firstName lastName email phone' }
      ]);

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

    ticket.paymentStatus = status;
    if (reference) {
      ticket.paymentReference = reference;
    }

    await ticket.save();

    // Send ticket email if payment completed
    if (status === 'completed') {
      try {
        await sendTicketEmail(ticket);
      } catch (emailError) {
        console.error('Email send error:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Statut de paiement mis à jour',
      data: ticket
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut'
    });
  }
});

// Get ticket details
router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate([
        { path: 'event', select: 'title date time location address image organizer' },
        { path: 'user', select: 'firstName lastName email phone' }
      ]);

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
      data: ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du billet'
    });
  }
});

// Validate ticket (Admin only)
router.patch('/:id/validate', protect, adminOnly, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Billet non trouvé'
      });
    }

    if (ticket.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'Ce billet a déjà été utilisé'
      });
    }

    if (ticket.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Le paiement de ce billet n\'est pas confirmé'
      });
    }

    ticket.isUsed = true;
    ticket.usedAt = new Date();
    await ticket.save();

    res.json({
      success: true,
      message: 'Billet validé avec succès',
      data: ticket
    });
  } catch (error) {
    console.error('Validate ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du billet'
    });
  }
});

export default router;