import http from './http';

export const lessonsApi = {
  listByCourse: (courseId) =>
    http.get(`/api/courses/${courseId}/lessons`).then((r) => r.data),
  create: (courseId, data) =>
    http.post(`/api/courses/${courseId}/lessons`, data).then((r) => r.data),
  update: (id, data) => http.put(`/api/lessons/${id}`, data).then((r) => r.data),
  remove: (id) => http.delete(`/api/lessons/${id}`),

  // Progreso del alumno
  completed: (courseId) =>
    http.get(`/api/courses/${courseId}/lessons/completed`).then((r) => r.data),
  complete: (id) => http.post(`/api/lessons/${id}/complete`),
  uncomplete: (id) => http.delete(`/api/lessons/${id}/complete`),

  // Adjuntos
  attachments: (id) => http.get(`/api/lessons/${id}/attachments`).then((r) => r.data),
  addAttachment: (id, data) =>
    http.post(`/api/lessons/${id}/attachments`, data).then((r) => r.data),
  removeAttachment: (attachmentId) =>
    http.delete(`/api/lessons/attachments/${attachmentId}`),
};
