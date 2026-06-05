import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import AdminLogin from './AdminLogin';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import DashboardSection from './DashboardSection';
import UsersSection from './UsersSection';
import CoursesSection from './CoursesSection';
import CourseEditorPage from './CourseEditorPage';
import Loading from '../../components/Loading';
import './AdminPage.css';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'users',     label: 'Usuarios',  icon: <Users size={16} /> },
  { id: 'courses',   label: 'Cursos',    icon: <BookOpen size={16} /> },
];

export default function AdminPage() {
  const { admin, checking, login, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (checking) return <Loading minHeight="100vh" />;
  if (!admin)   return <AdminLogin onLogin={login} />;

  // La sección activa se deriva de la URL (/admin/<seccion>).
  const active = location.pathname.split('/')[2] || 'dashboard';
  const section = NAV.find(n => n.id === active)?.label ?? '';

  return (
    <div className="admin-shell">
      <AdminSidebar
        nav={NAV}
        active={active}
        onSelect={(id) => navigate(`/admin/${id}`)}
        onLogout={logout}
      />

      <div className="admin-main">
        <AdminTopbar section={section} username={admin.username} />

        <div className="admin-content">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardSection />} />
            <Route path="users" element={<UsersSection />} />
            <Route path="courses" element={<CoursesSection />} />
            <Route path="courses/:courseId" element={<CourseEditorPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
