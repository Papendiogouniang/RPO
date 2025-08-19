import express from 'express';
import multer from 'multer';
import path from 'path';
import { body, validationResult } from 'express-validator';
import Event from '../models/Event.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'backend/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, featured } = req.query;
    
    const query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }

    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements'
    });
  }
});

// Get featured events
router.get('/featured', async (req, res) => {
  try {
    const events = await Event.find({ 
      isActive: true, 
      isFeatured: true,
      date: { $gte: new Date() }
    })
    .populate('organizer', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get featured events error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements à la une'
    });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email phone');

    if (!event || !event.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'événement'
    });
  }
});

// Create event (Admin only)
router.post('/', protect, adminOnly, upload.single('image'), [
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('description').notEmpty().withMessage('La description est requise'),
  body('date').isISO8601().withMessage('Date invalide'),
  body('time').notEmpty().withMessage('L\'heure est requise'),
  body('location').notEmpty().withMessage('Le lieu est requis'),
  body('address').notEmpty().withMessage('L\'adresse est requise'),
  body('price').isNumeric().withMessage('Le prix doit être un nombre'),
  body('capacity').isInt({ min: 1 }).withMessage('La capacité doit être un nombre positif'),
  body('category').isIn(['concert', 'conference', 'formation', 'spectacle', 'sport', 'autre']).withMessage('Catégorie invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const eventData = {
      ...req.body,
      organizer: req.user.id,
      availableTickets: req.body.capacity,
      price: parseFloat(req.body.price),
      capacity: parseInt(req.body.capacity),
      isFeatured: req.body.isFeatured === 'true'
    };

    if (req.file) {
      eventData.image = `/uploads/${req.file.filename}`;
    }

    const event = await Event.create(eventData);
    await event.populate('organizer', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'événement'
    });
  }
});

// Update event (Admin only)
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    const updateData = {
      ...req.body,
      isFeatured: req.body.isFeatured === 'true'
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    Object.assign(event, updateData);
    await event.save();
    await event.populate('organizer', 'firstName lastName');

    res.json({
      success: true,
      message: 'Événement mis à jour avec succès',
      data: event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'événement'
    });
  }
});

// Delete event (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    event.isActive = false;
    await event.save();

    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'événement'
    });
  }
});

// Toggle featured status (Admin only)
router.patch('/:id/featured', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    event.isFeatured = !event.isFeatured;
    await event.save();

    res.json({
      success: true,
      message: event.isFeatured ? 'Événement mis à la une' : 'Événement retiré de la une',
      data: event
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'événement'
    });
  }
});

export default router;