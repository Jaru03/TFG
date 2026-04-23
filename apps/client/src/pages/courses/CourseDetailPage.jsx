import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, FileText, User, ChevronRight, ChevronDown, Lock, CheckCircle2, Circle, FileDown } from 'lucide-react';
import './CourseDetailPage.css';

function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed${u.pathname}`;
    if (u.hostname.includes('vimeo.com')) return `https://player.vimeo.com/video${u.pathname}`;
  } catch { /* noop */ }
  return null;
}

function LessonMedia({ lessonId }) {
  const [attachments, setAttachments] = useState(null);

  useEffect(() => {
    axios.get(`/api/lessons/${lessonId}/attachments`)
      .then(r => setAttachments(r.data))
      .catch(() => setAttachments([]));
  }, [lessonId]);

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="lesson-media-list">
      {attachments.map(a => {
        if (a.type === 'image') {
          return (
            <img key={a.id} src={a.url} alt={a.original_name} className="lesson-media-image" />
          );
        }
        if (a.type === 'video') {
          return (
            <video key={a.id} controls className="lesson-media-video">
              <source src={a.url} type={a.mime_type} />
            </video>
          );
        }
        if (a.type === 'video_url') {
          const embed = toEmbedUrl(a.url);
          if (!embed) return null;
          return (
            <div key={a.id} className="lesson-media-embed">
              <iframe
                src={embed}
                title="vídeo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
        return (
          <a key={a.id} href={a.url} download={a.original_name} className="lesson-media-file" target="_blank" rel="noreferrer">
            <FileDown size={15} />
            {a.original_name || 'Descargar archivo'}
          </a>
        );
      })}
    </div>
  );
}

export default function CourseDetailPage({ user }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [tests, setTests] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [resultsByTestId, setResultsByTestId] = useState({});
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [courseRes, lessonsRes, testsRes, enrollmentRes, resultsRes] = await Promise.all([
          axios.get(`/api/courses/${id}`),
          axios.get(`/api/courses/${id}/lessons`),
          axios.get(`/api/courses/${id}/tests`),
          axios.get(`/api/courses/${id}/enrollment`),
          axios.get('/api/results/me'),
        ]);

        setCourse(courseRes.data);
        setLessons(lessonsRes.data);
        setTests(testsRes.data);
        setIsEnrolled(enrollmentRes.data.enrolled);

        const testIds = new Set(testsRes.data.map(t => t.id));
        const map = {};
        resultsRes.data
          .filter(r => testIds.has(r.test_id))
          .forEach(r => {
            if (map[r.test_id] === undefined || r.score > map[r.test_id]) {
              map[r.test_id] = r.score;
            }
          });
        setResultsByTestId(map);
      } catch {
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
    } catch {
      setError('No se pudo completar la inscripción.');
    } finally {
      setEnrolling(false);
    }
  };

  const [expandedLesson, setExpandedLesson] = useState(null);

  const completedCount = Object.keys(resultsByTestId).length;
  const progressPercent = tests.length > 0 ? Math.round((completedCount / tests.length) * 100) : 0;
  const allDone = tests.length > 0 && completedCount === tests.length;

  if (loading) return <div className="course-loading">Cargando...</div>;

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="course-detail">

      {/* ── Hero ── */}
      <section
        className="course-hero"
        style={course.cover_image ? {
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(${course.cover_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className={`course-hero-content ${course.cover_image ? 'course-hero-content--dark' : ''}`}>
          <div className="course-info">
            <h1>{course.title}</h1>
            <p className="course-description">{course.description}</p>
            <div className="course-meta">
              <span className="course-meta-item">
                <User size={15} />
                {course.instructor || 'Desconocido'}
              </span>
              <span className="course-meta-item">
                <BookOpen size={15} />
                {lessons.length} lección{lessons.length !== 1 ? 'es' : ''}
              </span>
              <span className="course-meta-item">
                <FileText size={15} />
                {tests.length} test{tests.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* ── Progress strip (only when enrolled and there are tests) ── */}
            {isEnrolled && tests.length > 0 && (
              <div className="course-progress">
                <div className="course-progress-meta">
                  <span className="course-progress-label">
                    {allDone
                      ? 'Curso completado'
                      : `${completedCount} de ${tests.length} tests completados`}
                  </span>
                  <span className={`course-progress-pct ${allDone ? 'done' : ''}`}>
                    {progressPercent}%
                  </span>
                </div>
                <div className="course-progress-track">
                  <div
                    className={`course-progress-fill ${allDone ? 'done' : ''}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="course-enroll">
            {isEnrolled ? (
              <div className="course-enrolled">
                <CheckCircle2 size={18} />
                <span>Inscrito</span>
              </div>
            ) : (
              <button
                className="course-enroll-btn"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? 'Inscribiéndose…' : 'Inscribirse'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="course-content">
        {isEnrolled ? (
          <>
            {/* Lessons */}
            {lessons.length > 0 && (
              <>
                <h2>Lecciones</h2>
                <div className="course-lessons">
                  {lessons.map((lesson, index) => {
                    const open = expandedLesson === lesson.id;
                    return (
                      <div key={lesson.id} className={`course-lesson ${open ? 'course-lesson--open' : ''}`}>
                        <button
                          className="course-lesson-header"
                          onClick={() => setExpandedLesson(open ? null : lesson.id)}
                          aria-expanded={open}
                        >
                          <span className="course-lesson-number">{index + 1}</span>
                          <span className="course-lesson-title">{lesson.title}</span>
                          <ChevronDown size={16} className="course-lesson-chevron" />
                        </button>
                        {open && (
                          <div className="course-lesson-body">
                            {lesson.content && <p>{lesson.content}</p>}
                            <LessonMedia lessonId={lesson.id} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Tests */}
            {tests.length > 0 && (
              <>
                <h2>Tests</h2>
                <div className="course-tests">
                  {tests.map(test => {
                    const score = resultsByTestId[test.id];
                    const done = score !== undefined;
                    return (
                      <Link
                        key={test.id}
                        to={`/tests/${test.id}`}
                        className={`course-test ${done ? 'course-test--done' : ''}`}
                      >
                        <span className="course-test-state-icon">
                          {done
                            ? <CheckCircle2 size={18} className="icon-done" />
                            : <Circle size={18} className="icon-pending" />}
                        </span>
                        <div className="course-test-info">
                          <h3>{test.title}</h3>
                          {test.description && <p>{test.description}</p>}
                        </div>
                        <div className="course-test-right">
                          {done ? (
                            <span className="course-test-score">{score} pts</span>
                          ) : (
                            <span className="course-test-pending">Pendiente</span>
                          )}
                          <ChevronRight size={16} className="course-test-chevron" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            {lessons.length === 0 && tests.length === 0 && (
              <div className="course-empty">Este curso no tiene contenido aún.</div>
            )}
          </>
        ) : (
          <div className="course-locked">
            <Lock size={40} />
            <h3>Contenido bloqueado</h3>
            <p>Inscríbete en el curso para acceder a las lecciones y tests.</p>
          </div>
        )}
      </section>
    </div>
  );
}
