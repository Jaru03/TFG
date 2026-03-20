import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, FileText, User, ChevronRight, Play } from 'lucide-react';
import Button from '../../components/Button';
import './CourseDetailPage.css';

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
    return <div className="course-loading">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const isProfessor = user.role === 'profesor' || user.role === 'administrador';

  return (
    <div className="course-detail">
      <section className="course-hero">
        <div className="course-hero-content">
          <div className="course-info">
            <h1>{course.title}</h1>
            <p className="course-description">{course.description}</p>
            <div className="course-meta">
              <span className="course-meta-item">
                <User size={16} />
                {course.instructor || 'Desconocido'}
              </span>
              <span className="course-meta-item">
                <BookOpen size={16} />
                {lessons.length} lecciones
              </span>
              <span className="course-meta-item">
                <FileText size={16} />
                {tests.length} tests
              </span>
            </div>
          </div>
          <div className="course-cta">
            <div className="course-cta-card">
              <img src="https://img-c.udemycdn.com/course/480x270/6795483_a223_2.jpg?w=3840&q=75" alt={course.title} className="course-cta-image" />
              <div className="course-cta-content">
                <Button className="course-enroll-btn">Inscribirse</Button>
                {isProfessor && (
                  <Link to={`/courses/create?edit=${course.id}`} className="course-edit-link">
                    Editar curso
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="course-content">
        <div className="course-content-grid">
          <div className="course-main">
            <h2>Contenido del curso</h2>
            {lessons.length === 0 ? (
              <div className="course-empty">No hay lecciones disponibles.</div>
            ) : (
              <div className="course-lessons">
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="course-lesson">
                    <span className="course-lesson-number">{index + 1}</span>
                    <div className="course-lesson-content">
                      <h3>{lesson.title}</h3>
                      <p>{lesson.content}</p>
                    </div>
                    <Play size={16} className="course-lesson-icon" />
                  </div>
                ))}
              </div>
            )}

            {tests.length > 0 && (
              <>
                <h2>Tests</h2>
                <div className="course-tests">
                  {tests.map(test => (
                    <Link key={test.id} to={`/tests/${test.id}`} className="course-test">
                      <div className="course-test-info">
                        <h3>{test.title}</h3>
                        <p>{test.description}</p>
                      </div>
                      <ChevronRight size={20} className="course-test-icon" />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {isProfessor && (
            <div className="course-sidebar">
              <h3>Gestionar</h3>
              <div className="course-sidebar-links">
                <Link to={`/courses/${id}/lessons`} className="course-sidebar-link">
                  <BookOpen size={18} />
                  <span>Lecciones</span>
                </Link>
                <Link to={`/courses/${id}/tests`} className="course-sidebar-link">
                  <FileText size={18} />
                  <span>Tests</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
