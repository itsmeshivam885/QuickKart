import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [{
      type: String, // e.g. 'Fast Service', 'Exact Match', 'Fair Price'
    }],
  },
  { timestamps: true }
);

// Update shop's average rating after saving review
reviewSchema.post('save', async function () {
  const Review = this.constructor;
  const stats = await Review.aggregate([
    { $match: { shopId: this.shopId } },
    {
      $group: {
        _id: '$shopId',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Shop').findByIdAndUpdate(this.shopId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].numReviews,
    });
  }
});

export default mongoose.model('Review', reviewSchema);
