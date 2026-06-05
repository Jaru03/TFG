import http from './http';

export const resultsApi = {
  me: () => http.get('/api/results/me').then((r) => r.data),
  attempts: (testId) =>
    http.get(`/api/results/tests/${testId}/attempts`).then((r) => r.data),
  submit: (testId, payload) =>
    http.post(`/api/results/tests/${testId}/submit`, payload).then((r) => r.data),
};
