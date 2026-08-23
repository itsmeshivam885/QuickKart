import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopName: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Your trusted neighborhood store',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, required: true },
      area: { type: String, default: '' },
      landmark: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, default: 'Delhi' },
      pincode: { type: String, required: true },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere',
      },
    },
    openingHours: {
      open: { type: String, default: '09:00 AM' },
      close: { type: String, default: '09:00 PM' },
      days: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      isOpenNow: { type: Boolean, default: true },
    },
    images: [{
      type: String,
    }],
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=1200&q=80',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    documents: [{
      docType: String,
      docUrl: String,
    }],
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isAcceptingRequests: {
      type: Boolean,
      default: true,
    },
    liveState: {
      currentlyServing: { type: Number, default: 2 },
      queueTimeMinutes: { type: Number, default: 5 },
      responseRatePercent: { type: Number, default: 96 },
      lastActiveMinutesAgo: { type: Number, default: 3 },
      isAvailableNow: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

shopSchema.index({ location: '2dsphere' });
shopSchema.index({ shopName: 'text', description: 'text', category: 'text' });

export default mongoose.model('Shop', shopSchema);
