import { GraduationCap, LogOut } from 'lucide-react';

export default function AdminSidebar({ nav, active, onSelect, onLogout }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <GraduationCap size={20} />
        <span>EduTech</span>
      </div>

      <div className="admin-sidebar-label">Panel</div>

      <nav className="admin-nav">
        {nav.map(item => (
          <button
            key={item.id}
            className={`admin-nav-item${active === item.id ? ' active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-nav-item admin-logout" onClick={onLogout}>
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
