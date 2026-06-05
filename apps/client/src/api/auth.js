import http from './http';

export const authApi = {
  me: () => http.get('/api/auth/me').then((r) => r.data),
  logoutUrl: '/auth/logout',
  // El login con Google es una redirección del navegador, no una petición XHR.
  loginUrl: '/auth/google',
};
