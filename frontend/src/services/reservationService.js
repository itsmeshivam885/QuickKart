import api from './api';

export const reservationService = {
  createReservation: async (data) => {
    const res = await api.post('/reservations', data);
    return res.data;
  },

  getCustomerReservations: async () => {
    const res = await api.get('/reservations/my');
    return res.data;
  },

  getShopReservations: async (params = {}) => {
    const res = await api.get('/reservations/shop', { params });
    return res.data;
  },

  updateStatus: async (id, statusData) => {
    const res = await api.put(`/reservations/${id}/status`, statusData);
    return res.data;
  },
};
