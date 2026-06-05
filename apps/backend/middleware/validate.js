import { HttpError } from './errorHandler.js';

/**
 * Valida y normaliza `req.body` contra un esquema Zod antes de llegar al
 * controller. En caso de error lanza un `HttpError(400)` con el primer mensaje
 * (en español, definido en el esquema), que el manejador global formatea como
 * el resto de errores. Si pasa, sustituye `req.body` por los datos ya
 * parseados (con trim, coerción de tipos y valores por defecto aplicados), de
 * modo que el controller recibe datos limpios y no tiene que validar nada.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new HttpError(400, result.error.issues[0].message));
    }
    req.body = result.data;
    next();
  };
}
