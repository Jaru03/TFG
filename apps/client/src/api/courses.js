import http from './http';

export const coursesApi = {
  list: () => http.get('/api/courses').then((r) => r.data),
  get: (id) => http.get(`/api/courses/${id}`).then((r) => r.data),
  create: (data) => http.post('/api/courses', data).then((r) => r.data),
  update: (id, data) => http.put(`/api/courses/${id}`, data).then((r) => r.data),

  enrolled: () => http.get('/api/courses/enrolled').then((r) => r.data),
  teacherStats: () => http.get('/api/courses/stats').then((r) => r.data),
  stats: (id) => http.get(`/api/courses/${id}/stats`).then((r) => r.data),
  enrollment: (id) => http.get(`/api/courses/${id}/enrollment`).then((r) => r.data),
  enroll: (id) => http.post(`/api/courses/${id}/enroll`),
  studentsProgress: (id, { page = 1, limit = 10 } = {}) =>
    http.get(`/api/courses/${id}/students-progress?page=${page}&limit=${limit}`).then((r) => r.data),
};
