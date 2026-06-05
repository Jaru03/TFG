import './Loading.css';

/**
 * Indicador de carga reutilizable: spinner + mensaje, centrado.
 *
 * @param {string} message   - Texto a mostrar (por defecto "Cargando…")
 * @param {string} minHeight - Alto mínimo del contenedor para centrar en un área (p. ej. "50vh")
 * @param {string} className - Clases extra para casos ligados al layout (p. ej. grid-column)
 */
export default function Loading({ message = 'Cargando…', minHeight, className = '' }) {
  return (
    <div
      className={`loading-state ${className}`.trim()}
      style={minHeight ? { minHeight } : undefined}
    >
      <span className="loading-spinner" aria-hidden="true" />
      <span className="loading-message">{message}</span>
    </div>
  );
}
