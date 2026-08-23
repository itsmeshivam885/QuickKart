import api from './api';

export const shopService = {
  getNearbyShops: async (params = {}) => {
    const res = await api.get('/shops/nearby', { params });
    return res.data;
  },

  getShopById: async (id, params = {}) => {
    const res = await api.get(`/shops/${id}`, { params });
    return res.data;
  },

  registerShop: async (shopData) => {
    const res = await api.post('/shops', shopData);
    return res.data;
  },

  getMyShop: async () => {
    const res = await api.get('/shops/my-shop');
    return res.data;
  },

  updateMyShop: async (shopData) => {
    const res = await api.put('/shops/my-shop', shopData);
    return res.data;
  },
};
