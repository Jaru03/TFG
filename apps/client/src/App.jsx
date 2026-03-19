import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
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
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

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
