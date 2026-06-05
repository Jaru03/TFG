// Punto de entrada único de la capa de API. Los componentes importan desde
// aquí: `import { coursesApi } from '../api'`.
export { default as http } from './http';
export { authApi } from './auth';
export { coursesApi } from './courses';
export { lessonsApi } from './lessons';
export { testsApi } from './tests';
export { resultsApi } from './results';
export { adminApi } from './admin';
