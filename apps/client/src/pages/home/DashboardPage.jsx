import HeroSection from "../../components/Dashboard/HeroSection";
import TeacherDashboard from "../../components/Dashboard/TeacherDashboard";

export default function DashboardPage({ user }) {
  const isTeacher = user.role === 'profesor' || user.role === 'administrador';

  if (isTeacher) {
    return (
      <main className="container">
        <TeacherDashboard user={user} />
      </main>
    );
  }

  return (
    <main className="container">
      <HeroSection user={user} />
    </main>
  );
}
