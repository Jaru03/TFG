import http from './http';

export const adminApi = {
  // Auth
  me: () => http.get('/api/admin/me').then((r) => r.data),
  login: (credentials) => http.post('/api/admin/login', credentials).then((r) => r.data),
  logout: () => http.post('/api/admin/logout'),

  // Stats
  stats: () => http.get('/api/admin/stats').then((r) => r.data),

  // Users
  users: () => http.get('/api/admin/users').then((r) => r.data),
  updateUser: (id, data) => http.put(`/api/admin/users/${id}`, data).then((r) => r.data),
  removeUser: (id) => http.delete(`/api/admin/users/${id}`),

  // Courses
  courses: () => http.get('/api/admin/courses').then((r) => r.data),
  course: (id) => http.get(`/api/admin/courses/${id}`).then((r) => r.data),
  courseStats: (id) => http.get(`/api/admin/courses/${id}/stats`).then((r) => r.data),
  createCourse: (data) => http.post('/api/admin/courses', data).then((r) => r.data),
  updateCourse: (id, data) => http.put(`/api/admin/courses/${id}`, data).then((r) => r.data),
  removeCourse: (id) => http.delete(`/api/admin/courses/${id}`),

  // Lessons (anidadas bajo curso)
  courseLessons: (courseId) =>
    http.get(`/api/admin/courses/${courseId}/lessons`).then((r) => r.data),
  createLesson: (courseId, data) =>
    http.post(`/api/admin/courses/${courseId}/lessons`, data).then((r) => r.data),
  updateLesson: (id, data) =>
    http.put(`/api/admin/lessons/${id}`, data).then((r) => r.data),
  removeLesson: (id) => http.delete(`/api/admin/lessons/${id}`),

  // Tests
  tests: () => http.get('/api/admin/tests').then((r) => r.data),
  courseTests: (courseId) =>
    http.get(`/api/admin/courses/${courseId}/tests`).then((r) => r.data),
  createTest: (courseId, data) =>
    http.post(`/api/admin/courses/${courseId}/tests`, data).then((r) => r.data),
  updateTest: (id, data) => http.put(`/api/admin/tests/${id}`, data).then((r) => r.data),
  removeTest: (id) => http.delete(`/api/admin/tests/${id}`),

  // Questions
  testQuestions: (testId) =>
    http.get(`/api/admin/tests/${testId}/questions`).then((r) => r.data),
  createQuestion: (testId, data) =>
    http.post(`/api/admin/tests/${testId}/questions`, data).then((r) => r.data),
  updateQuestion: (id, data) =>
    http.put(`/api/admin/questions/${id}`, data).then((r) => r.data),
  removeQuestion: (id) => http.delete(`/api/admin/questions/${id}`),
};
