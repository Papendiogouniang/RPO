import express from 'express';
import multer from 'multer';
import path from 'path';
import { body, validationResult } from 'express-validator';
import HeroSlide from '../models/HeroSlide.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'backend/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'slide-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all active slides (public)
router.get('/', async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: slides
    });
  } catch (error) {
    console.error('Get slides error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des slides'
    });
  }
});

// Get all slides (Admin only)
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const slides = await HeroSlide.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: slides
    });
  } catch (error) {
    console.error('Get admin slides error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des slides'
    });
  }
});

// Create slide (Admin only)
router.post('/', protect, adminOnly, upload.single('image'), [
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('subtitle').notEmpty().withMessage('Le sous-titre est requis'),
  body('description').notEmpty().withMessage('La description est requise')
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'L\'image est requise'
      });
    }

    const slideData = {
      ...req.body,
      image: `/uploads/${req.file.filename}`,
      order: parseInt(req.body.order) || 0
    };

    const slide = await HeroSlide.create(slideData);

    res.status(201).json({
      success: true,
      message: 'Slide créé avec succès',
      data: slide
    });
  } catch (error) {
    console.error('Create slide error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du slide'
    });
  }
});

// Update slide (Admin only)
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Slide non trouvé'
      });
    }

    const updateData = {
      ...req.body,
      order: parseInt(req.body.order) || slide.order
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    Object.assign(slide, updateData);
    await slide.save();

    res.json({
      success: true,
      message: 'Slide mis à jour avec succès',
      data: slide
    });
  } catch (error) {
    console.error('Update slide error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du slide'
    });
  }
});

// Delete slide (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Slide non trouvé'
      });
    }

    await HeroSlide.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Slide supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete slide error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du slide'
    });
  }
});

// Toggle slide status (Admin only)
router.patch('/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    
    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Slide non trouvé'
      });
    }

    slide.isActive = !slide.isActive;
    await slide.save();

    res.json({
      success: true,
      message: slide.isActive ? 'Slide activé' : 'Slide désactivé',
      data: slide
    });
  } catch (error) {
    console.error('Toggle slide error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du slide'
    });
  }
});

export default router;