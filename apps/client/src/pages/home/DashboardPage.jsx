import HeroSection from '../../components/Dashboard/HeroSection';
import TeacherDashboard from '../../components/Dashboard/TeacherDashboard';
import { isTeacher } from '../../lib/roles';

export default function DashboardPage({ user }) {
  return isTeacher(user)
    ? <TeacherDashboard user={user} />
    : <HeroSection />;
}
