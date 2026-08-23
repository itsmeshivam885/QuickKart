import api from './api';

export const agentService = {
  planGoal: async (payload) => {
    const res = await api.post('/agent/plan-goal', payload);
    return res.data;
  },

  diagnoseProblem: async (payload) => {
    const res = await api.post('/agent/diagnose-problem', payload);
    return res.data;
  },

  reserveMultiPlan: async (payload) => {
    const res = await api.post('/agent/reserve-multi-plan', payload);
    return res.data;
  },
};
