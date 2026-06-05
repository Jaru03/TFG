import http from './http';

export const testsApi = {
  listByCourse: (courseId) =>
    http.get(`/api/courses/${courseId}/tests`).then((r) => r.data),
  create: (courseId, data) =>
    http.post(`/api/courses/${courseId}/tests`, data).then((r) => r.data),
  get: (id) => http.get(`/api/tests/${id}`).then((r) => r.data),
  update: (id, data) => http.put(`/api/tests/${id}`, data).then((r) => r.data),
  remove: (id) => http.delete(`/api/tests/${id}`),

  // Preguntas
  questions: (id) => http.get(`/api/tests/${id}/questions`).then((r) => r.data),
  createQuestion: (testId, data) =>
    http.post(`/api/tests/${testId}/questions`, data).then((r) => r.data),
  updateQuestion: (testId, questionId, data) =>
    http.put(`/api/tests/${testId}/questions/${questionId}`, data).then((r) => r.data),
  removeQuestion: (testId, questionId) =>
    http.delete(`/api/tests/${testId}/questions/${questionId}`),
};
