import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  date: {
    type: Date,
    required: [true, 'La date est requise']
  },
  time: {
    type: String,
    required: [true, 'L\'heure est requise']
  },
  location: {
    type: String,
    required: [true, 'Le lieu est requis'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'L\'adresse est requise'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: 0
  },
  capacity: {
    type: Number,
    required: [true, 'La capacité est requise'],
    min: 1
  },
  availableTickets: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: ['concert', 'conference', 'formation', 'spectacle', 'sport', 'autre']
  },
  image: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for featured events
eventSchema.index({ isFeatured: -1, createdAt: -1 });

export default mongoose.model('Event', eventSchema);