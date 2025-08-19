import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  subtitle: {
    type: String,
    required: [true, 'Le sous-titre est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  image: {
    type: String,
    required: [true, 'L\'image est requise']
  },
  buttonText: {
    type: String,
    default: 'Découvrir'
  },
  buttonLink: {
    type: String,
    default: '/events'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for ordering slides
heroSlideSchema.index({ order: 1, createdAt: -1 });

export default mongoose.model('HeroSlide', heroSlideSchema);