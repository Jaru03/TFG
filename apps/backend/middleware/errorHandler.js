import multer from 'multer';

/**
 * Error operacional con código HTTP asociado.
 * Permite a controllers y servicios lanzar errores "esperados"
 * (p. ej. `throw new HttpError(404, 'Curso no encontrado')`) que el
 * manejador central traducirá a la respuesta JSON adecuada.
 */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/**
 * Envuelve un handler async para que cualquier promesa rechazada se
 * reenvíe a `next(err)`. Sin esto, en Express 4 una excepción dentro de
 * un handler async deja la petición colgada hasta el timeout.
 */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/**
 * Aplica `asyncHandler` a todos los handlers exportados por un controller.
 * Una sola línea por archivo: `export default wrapController({ ... })`.
 */
function wrapController(handlers) {
  const wrapped = {};
  for (const [name, fn] of Object.entries(handlers)) {
    wrapped[name] = typeof fn === 'function' ? asyncHandler(fn) : fn;
  }
  return wrapped;
}

/**
 * Captura cualquier ruta no encontrada y la convierte en un 404 con el
 * mismo formato JSON que el resto de errores.
 */
function notFound(req, res, next) {
  next(new HttpError(404, 'Recurso no encontrado'));
}

/* eslint-disable no-unused-vars */
/**
 * Manejador de errores global. Debe montarse el último, después de las
 * rutas. Express lo identifica por tener 4 argumentos.
 */
function errorHandler(err, req, res, next) {
  // Errores de Multer (límite de tamaño, etc.) y validación de ficheros.
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Error al subir el fichero: ${err.message}` });
  }

  // Errores operacionales conocidos (HttpError) o el bloqueo de CORS.
  const status = err.status || err.statusCode;
  if (status && status < 500) {
    return res.status(status).json({ message: err.message });
  }
  if (err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({ message: 'Origen no permitido por CORS' });
  }

  // Error inesperado: se registra completo en el servidor pero al cliente
  // solo se le devuelve un mensaje genérico (no se filtran detalles internos).
  console.error('[error]', req.method, req.originalUrl, '\n', err);
  const body = { message: 'Error interno del servidor' };
  if (process.env.NODE_ENV !== 'production') {
    body.error = err.message;
  }
  res.status(500).json(body);
}

export { HttpError, asyncHandler, wrapController, notFound, errorHandler };
