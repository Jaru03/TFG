import { AlertCircle, CheckCircle } from 'lucide-react';
import './Alert.css';

/**
 * Mensaje de alerta reutilizable.
 *
 * @param {'error'|'success'} type - Tipo de alerta (por defecto "error")
 * @param {ReactNode} children     - Contenido del mensaje
 */
export default function Alert({ type = 'error', children }) {
  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  return (
    <div className={`alert-box alert-box--${type}`} role="alert">
      <Icon size={18} className="alert-box-icon" />
      <span>{children}</span>
    </div>
  );
}
