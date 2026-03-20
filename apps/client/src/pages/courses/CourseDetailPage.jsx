import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, FileText, User, ChevronRight, Play, Lock, Check } from 'lucide-react';
import './CourseDetailPage.css';

export default function CourseDetailPage({ user }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [tests, setTests] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [courseRes, lessonsRes, testsRes, enrollmentRes] = await Promise.all([
          axios.get(`/api/courses/${id}`),
          axios.get(`/api/courses/${id}/lessons`),
          axios.get(`/api/courses/${id}/tests`),
          axios.get(`/api/courses/${id}/enrollment`)
        ]);
        setCourse(courseRes.data);
        setLessons(lessonsRes.data);
        setTests(testsRes.data);
        setIsEnrolled(enrollmentRes.data.enrolled);
      } catch (err) {
        setError('Error al cargar el curso.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await axios.post(`/api/courses/${id}/enroll`);
      setIsEnrolled(true);
    } catch (err) {
      setError('No se pudo completar la inscripción.');
    } finally {
      setEnrolling(false);
    }
  };

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
          <div className="course-enroll">
            {isEnrolled ? (
              <div className="course-enrolled">
                <Check size={20} />
                <span>Inscrito</span>
              </div>
            ) : (
              <button
                className="course-enroll-btn"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? 'Inscribiéndose...' : 'Inscribirse'}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="course-content">
        <h2>Contenido del curso</h2>
        {isEnrolled ? (
          <>
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
          </>
        ) : (
          <div className="course-locked">
            <Lock size={48} />
            <h3>Contenido bloqueado</h3>
            <p>Inscríbete en el curso para acceder a las lecciones y tests.</p>
          </div>
        )}
      </section>
    </div>
  );
}
