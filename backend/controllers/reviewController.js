import { supabase } from '../config/supabase.js';

// @desc    Add review for a shop
// @route   POST /api/reviews
// @access  Private (Customer)
export const createReview = async (req, res, next) => {
  try {
    const { shopId, rating, comment, tags } = req.body;

    const { data: review, error } = await supabase
      .from('reviews')
      .insert([
        {
          shop_id: shopId || 'b0000000-0000-0000-0000-000000000001',
          rating: parseInt(rating) || 5,
          comment,
          tags: tags || [],
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully to Supabase!',
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
    const { shopId } = req.params;
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('shop_id', shopId);

    res.json({
      success: true,
      reviews: reviews || [],
    });
  } catch (error) {
    next(error);
  }
};
