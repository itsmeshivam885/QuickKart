import Review from '../models/Review.js';
import Shop from '../models/Shop.js';

// @desc    Submit a review for a shop
// @route   POST /api/reviews
// @access  Private (Customer)
export const createReview = async (req, res, next) => {
  try {
    const { shopId, reservationId, rating, comment, tags } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const review = await Review.create({
      customerId: req.user._id,
      shopId,
      reservationId: reservationId || null,
      rating: Math.min(5, Math.max(1, parseFloat(rating))),
      comment,
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a shop
// @route   GET /api/reviews/shop/:shopId
// @access  Public
export const getShopReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ shopId: req.params.shopId })
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};
