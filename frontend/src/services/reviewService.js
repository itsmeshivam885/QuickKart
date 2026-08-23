import api from './api';

export const reviewService = {
  createReview: async (reviewData) => {
    const res = await api.post('/reviews', reviewData);
    return res.data;
  },

  getShopReviews: async (shopId) => {
    const res = await api.get(`/reviews/shop/${shopId}`);
    return res.data;
  },
};
