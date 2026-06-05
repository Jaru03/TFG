import './EmptyState.css';

/**
 * Estado vacío reutilizable: icono opcional + mensaje + texto secundario + acción.
 *
 * @param {ReactNode} icon    - Icono opcional (p. ej. <FileText size={48} />)
 * @param {string}    message - Texto principal
 * @param {string}    hint    - Texto secundario opcional
 * @param {ReactNode} action  - Acción opcional (botón o enlace)
 * @param {boolean}   boxed   - Si true, envuelve en una tarjeta con borde y fondo
 * @param {string}    className - Clases extra para casos ligados al layout (p. ej. grid-column)
 */
export default function EmptyState({ icon, message, hint, action, boxed = false, className = '' }) {
  return (
    <div className={`empty-state ${boxed ? 'empty-state--boxed' : ''} ${className}`.trim()}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      {message && <p className="empty-state-message">{message}</p>}
      {hint && <p className="empty-state-hint">{hint}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
