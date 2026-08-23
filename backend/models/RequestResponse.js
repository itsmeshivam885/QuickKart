import mongoose from 'mongoose';

const requestResponseSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
      index: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    shopkeeperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'available_alternative', 'not_available'],
      required: true,
    },
    offeredPrice: {
      type: Number,
      default: 0,
    },
    preparationTimeMinutes: {
      type: Number,
      default: 10,
    },
    notes: {
      type: String,
      default: '',
    },
    alternativeProductName: {
      type: String,
      default: '',
    },
    alternativeDetails: {
      type: String,
      default: '',
    },
    isBestValue: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate response from same shop for same request
requestResponseSchema.index({ requestId: 1, shopId: 1 }, { unique: true });

export default mongoose.model('RequestResponse', requestResponseSchema);
