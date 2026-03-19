import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./hooks/useAuth";
import {
  CourseDetailPage,
  CourseFormPage,
  CoursesPage,
  DashboardPage,
  LessonsPage,
  LoginPage,
  NotFoundPage,
  TestManagePage,
  TestsPage,
  TestViewPage,
  UsersAdminPage,
} from "./pages";

axios.defaults.withCredentials = true;

function App() {
  const { user, checking } = useAuth();

  if (checking) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <DashboardPage user={user} /> : <LoginPage />}
      />
      <Route
        path="/courses"
        element={
          user ? <CoursesPage user={user} /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/courses/create"
        element={
          user ? <CourseFormPage user={user} /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/courses/:id"
        element={
          user ? <CourseDetailPage user={user} /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/courses/:id/lessons"
        element={
          user ? <LessonsPage user={user} /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/courses/:id/tests"
        element={user ? <TestsPage user={user} /> : <Navigate to="/" replace />}
      />
      <Route
        path="/tests/:id"
        element={
          user ? <TestViewPage user={user} /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/tests/:id/manage"
        element={
          user ? <TestManagePage user={user} /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/users"
        element={
          user ? <UsersAdminPage user={user} /> : <Navigate to="/" replace />
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
