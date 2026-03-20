import { useState } from 'react';
import { Users } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import AdminLogin from './AdminLogin';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import UsersSection from './UsersSection';
import './AdminPage.css';

const NAV = [
  { id: 'users', label: 'Usuarios', icon: <Users size={18} /> },
];

export default function AdminPage() {
  const { admin, checking, login, logout } = useAdminAuth();
  const [active, setActive] = useState('users');

  if (checking) return <div className="admin-loading">Cargando…</div>;
  if (!admin) return <AdminLogin onLogin={login} />;

  return (
    <div className="admin-shell">
      <AdminSidebar
        nav={NAV}
        active={active}
        onSelect={setActive}
        onLogout={logout}
      />

      <div className="admin-main">
        <AdminTopbar
          section={NAV.find(n => n.id === active)?.label}
          username={admin.username}
        />

        <div className="admin-content">
          {active === 'users' && <UsersSection />}
        </div>
      </div>
    </div>
  );
}
