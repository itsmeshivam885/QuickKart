import api from './api';

export const chatService = {
  getConversations: async () => {
    const res = await api.get('/chat/conversations');
    return res.data;
  },

  getOrCreateConversation: async (contextData) => {
    const res = await api.post('/chat/conversations', contextData);
    return res.data;
  },

  getMessages: async (conversationId) => {
    const res = await api.get(`/chat/conversations/${conversationId}/messages`);
    return res.data;
  },

  sendMessage: async (conversationId, messageData) => {
    const res = await api.post(`/chat/conversations/${conversationId}/messages`, messageData);
    return res.data;
  },

  getNotifications: async () => {
    const res = await api.get('/chat/notifications');
    return res.data;
  },

  markNotificationsRead: async () => {
    const res = await api.put('/chat/notifications/read-all');
    return res.data;
  },
};
