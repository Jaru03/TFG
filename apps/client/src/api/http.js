import axios from 'axios';

// Instancia única de axios para toda la app. Las rutas relativas (/api, /auth)
// las redirige el proxy de Vite al backend en desarrollo (ver vite.config.js),
// y en producción las sirve el propio Express. `withCredentials` envía la
// cookie de sesión en cada petición.
const http = axios.create({
  withCredentials: true,
});

export default http;
