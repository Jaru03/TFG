import HeroSection from '../../components/Dashboard/HeroSection';
import TeacherDashboard from '../../components/Dashboard/TeacherDashboard';

export default function DashboardPage({ user }) {
  const isTeacher = user.role === 'profesor' || user.role === 'administrador';

  return isTeacher
    ? <TeacherDashboard user={user} />
    : <HeroSection user={user} />;
}
