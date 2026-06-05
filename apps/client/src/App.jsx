import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { isTeacher } from "./lib/roles";
import Layout from "./components/Layout";
import {
  AccountPage,
  AdminPage,
  CourseDetailPage,
  CourseDetailTeacher,
  CourseFormPage,
  CoursesPage,
  DashboardPage,
  LessonsPage,
  LoginPage,
  MyCoursesPage,
  NotFoundPage,
  ProgressPage,
  TestManagePage,
  TestsPage,
  TestViewPage,
} from "./pages";

function App() {
  const { user, checking, logout } = useAuth();

  if (checking) {
    return <div className="loading">Cargando...</div>;
  }

  const isProfessor = isTeacher(user);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route element={user ? <Layout user={user} logout={logout} /> : <Navigate to="/login" replace />}>
        <Route path="/" element={<DashboardPage user={user} />} />
        <Route path="/courses" element={<CoursesPage user={user} />} />
        <Route path="/courses/create" element={<CourseFormPage />} />
        <Route path="/courses/:id" element={
          isProfessor 
            ? <CourseDetailTeacher />
            : <CourseDetailPage />
        } />
        <Route path="/courses/:id/lessons" element={<LessonsPage user={user} />} />
        <Route path="/courses/:id/tests" element={<TestsPage user={user} />} />
        <Route path="/tests/:id" element={<TestViewPage user={user} />} />
        <Route path="/tests/:id/manage" element={<TestManagePage user={user} />} />
        <Route path="/my-courses" element={<MyCoursesPage user={user} />} />
        <Route path="/progress" element={<ProgressPage user={user} />} />
        <Route path="/account" element={<AccountPage user={user} logout={logout} />} />
      </Route>

      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
