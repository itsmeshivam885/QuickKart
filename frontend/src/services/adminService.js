import api from './api';

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getAllShops: async (params = {}) => {
    const res = await api.get('/admin/shops', { params });
    return res.data;
  },

  verifyShop: async (id, data) => {
    const res = await api.put(`/admin/shops/${id}/verify`, data);
    return res.data;
  },

  getAllUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  toggleUserStatus: async (id, status) => {
    const res = await api.put(`/admin/users/${id}/status`, { status });
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/admin/categories');
    return res.data;
  },

  createCategory: async (categoryData) => {
    const res = await api.post('/admin/categories', categoryData);
    return res.data;
  },
};
