import api from './api';

export const requestService = {
  createRequest: async (data) => {
    const res = await api.post('/requests', data);
    return res.data;
  },

  getMyRequests: async () => {
    const res = await api.get('/requests/my');
    return res.data;
  },

  getRequestDetails: async (id) => {
    const res = await api.get(`/requests/${id}`);
    return res.data;
  },

  getShopRelevantRequests: async () => {
    const res = await api.get('/requests/shop');
    return res.data;
  },

  respondToRequest: async (requestId, data) => {
    const res = await api.post(`/requests/${requestId}/respond`, data);
    return res.data;
  },
};
