import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";
import {
  AdminPage,
  CourseDetailPage,
  CourseDetailTeacher,
  CourseFormPage,
  CoursesPage,
  DashboardPage,
  LessonsPage,
  LoginPage,
  NotFoundPage,
  TestManagePage,
  TestsPage,
  TestViewPage,
} from "./pages";

axios.defaults.withCredentials = true;

function App() {
  const { user, checking, logout } = useAuth();

  if (checking) {
    return <div className="loading">Cargando...</div>;
  }

  const isProfessor = user && (user.role === 'profesor' || user.role === 'administrador');

  const ProtectedLayout = () => {
    if (!user) return <Navigate to="/login" replace />;
    return <Layout user={user} logout={logout} />;
  };

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage user={user} />} />
        <Route path="/courses" element={<CoursesPage user={user} />} />
        <Route path="/courses/create" element={<CourseFormPage user={user} />} />
        <Route path="/courses/:id" element={
          isProfessor 
            ? <CourseDetailTeacher user={user} /> 
            : <CourseDetailPage user={user} />
        } />
        <Route path="/courses/:id/lessons" element={<LessonsPage user={user} />} />
        <Route path="/courses/:id/tests" element={<TestsPage user={user} />} />
        <Route path="/tests/:id" element={<TestViewPage user={user} />} />
        <Route path="/tests/:id/manage" element={<TestManagePage user={user} />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
