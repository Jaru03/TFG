import './StatCard.css';

/**
 * Tarjeta de estadística reutilizable (estilo del panel de administración).
 *
 * @param {ReactNode} icon     - Icono (p. ej. <Users size={18} /> de lucide-react)
 * @param {string}    label    - Texto descriptivo bajo el valor
 * @param {string|number} value - Valor principal a destacar
 * @param {string}    iconBg   - Color de fondo del chip del icono
 * @param {string}    iconColor- Color del icono
 */
export default function StatCard({
  icon,
  label,
  value,
  iconBg = 'var(--clr-accent-subtle)',
  iconColor = 'var(--clr-accent)',
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-card-icon" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}
