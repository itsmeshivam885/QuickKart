import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    unit: {
      type: String,
      default: 'piece',
    },
    budget: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      default: '',
    },
    urgency: {
      type: String,
      enum: ['immediate', 'today', 'flexible'],
      default: 'immediate',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      addressText: {
        type: String,
        default: '',
      },
    },
    searchRadiusKm: {
      type: Number,
      default: 5,
    },
    status: {
      type: String,
      enum: ['active', 'fulfilled', 'expired', 'cancelled'],
      default: 'active',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    responsesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

requestSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.model('Request', requestSchema);
