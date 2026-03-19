import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

export default function CoursesPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/courses');
        setCourses(res.data);
      } catch (err) {
        setError('Error al cargar los cursos.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Header user={user} />
      <main className="container">
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Cursos</h1>
            {(user.role === 'profesor' || user.role === 'administrador') && (
              <Link className="button" to="/courses/create">
                Crear curso
              </Link>
            )}
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {loading ? (
            <div className="loading">Cargando cursos...</div>
          ) : courses.length === 0 ? (
            <div className="card">No hay cursos disponibles aún.</div>
          ) : (
            courses.map(course => (
              <div key={course.id} className="card">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  Profesor: {course.instructor || 'Desconocido'}
                </p>
                {(user.role === 'profesor' || user.role === 'administrador') && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <Link className="button" to={`/courses/create?edit=${course.id}`}>
                      Editar
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      </main>
    </>
  );
}
