import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

export default function CourseDetailPage({ user }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [courseRes, lessonsRes, testsRes] = await Promise.all([
          axios.get(`/api/courses/${id}`),
          axios.get(`/api/courses/${id}/lessons`),
          axios.get(`/api/courses/${id}/tests`)
        ]);
        setCourse(courseRes.data);
        setLessons(lessonsRes.data);
        setTests(testsRes.data);
      } catch (err) {
        setError('Error al cargar el curso.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <Header user={user} />
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <>
      <Header user={user} />
      <main className="container">
        <section>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <p style={{ color: '#6b7280' }}>
            Profesor: {course.instructor || 'Desconocido'}
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {(user.role === 'profesor' || user.role === 'administrador') && (
              <Link className="button" to={`/courses/create?edit=${course.id}`}>
                Editar curso
              </Link>
            )}
          </div>

          <h2 style={{ marginTop: '2rem' }}>Lecciones</h2>
          {(user.role === 'profesor' || user.role === 'administrador') && (
            <p>
              <Link className="button" to={`/courses/${id}/lessons`}>Gestionar lecciones</Link>
            </p>
          )}
          {lessons.length === 0 ? (
            <div className="card">No hay lecciones aún.</div>
          ) : (
            lessons.map(lesson => (
              <div key={lesson.id} className="card">
                <h3>{lesson.title}</h3>
                <p>{lesson.content}</p>
              </div>
            ))
          )}

          <h2 style={{ marginTop: '2rem' }}>Tests</h2>
          {(user.role === 'profesor' || user.role === 'administrador') && (
            <p>
              <Link className="button" to={`/courses/${id}/tests`}>Gestionar tests</Link>
            </p>
          )}
          {tests.length === 0 ? (
            <div className="card">No hay tests aún.</div>
          ) : (
            tests.map(test => (
              <div key={test.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{test.title}</h3>
                  <p>{test.description}</p>
                </div>
                <Link className="button" to={`/tests/${test.id}`}>
                  Realizar test
                </Link>
              </div>
            ))
          )}
        </section>
      </main>
    </>
  );
}
