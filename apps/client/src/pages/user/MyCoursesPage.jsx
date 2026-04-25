import { useEffect, useState } from 'react';
import axios from 'axios';
import CursoCard from '../../components/CursoCard';
import './UserPages.css';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/courses/enrolled');
        setCourses(res.data);
      } catch {
        setError('Error al cargar tus cursos.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="user-page">
      <div className="user-page-container">
        <div className="user-page-header">
          <h1>Mis cursos</h1>
          <p className="user-page-subtitle">Cursos en los que estás inscrito</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <div className="user-page-loading">Cargando...</div>
        ) : courses.length === 0 ? (
          <div className="user-page-empty">
            <p>No estás inscrito en ningún curso todavía.</p>
            <a href="/courses" className="user-page-link">Explorar cursos</a>
          </div>
        ) : (
          <div className="user-courses-grid">
            {courses.map((course) => (
              <CursoCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
