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

  toggleShopStatus: async (id, isActive) => {
    const res = await api.put(`/admin/shops/${id}/status`, { isActive });
    return res.data;
  },

  getAdminProducts: async (params = {}) => {
    const res = await api.get('/admin/products', { params });
    return res.data;
  },

  getSalesReport: async (params = {}) => {
    const res = await api.get('/admin/reports/sales', { params });
    return res.data;
  },

  getTrafficAnalytics: async (params = {}) => {
    const res = await api.get('/admin/reports/traffic', { params });
    return res.data;
  },

  getGeoMapData: async (params = {}) => {
    const res = await api.get('/admin/geo-map', { params });
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

  deleteCategory: async (id) => {
    const res = await api.delete(`/admin/categories/${id}`);
    return res.data;
  },

  createAdminUser: async (userData) => {
    const res = await api.post('/admin/users', userData);
    return res.data;
  },

  deleteAdminUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  createAdminShop: async (shopData) => {
    const res = await api.post('/admin/shops', shopData);
    return res.data;
  },

  deleteAdminShop: async (id) => {
    const res = await api.delete(`/admin/shops/${id}`);
    return res.data;
  },

  createAdminProduct: async (productData) => {
    const res = await api.post('/admin/products', productData);
    return res.data;
  },

  updateAdminProduct: async (id, productData) => {
    const res = await api.put(`/admin/products/${id}`, productData);
    return res.data;
  },

  deleteAdminProduct: async (id) => {
    const res = await api.delete(`/admin/products/${id}`);
    return res.data;
  },
};

