export default function StatCard({ icon, label, value, color }) {
  return (
    <div className="admin-stat" style={{ '--accent': color }}>
      <div className="admin-stat-icon">{icon}</div>
      <div>
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  );
}
