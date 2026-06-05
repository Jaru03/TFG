import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi, lessonsApi, testsApi, resultsApi } from '../../api';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, FileText, User, ChevronRight, ChevronDown, Lock, CheckCircle2, Circle, FileDown } from 'lucide-react';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Alert from '../../components/Alert';
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
  const { data: attachments } = useQuery({
    queryKey: ['lessons', lessonId, 'attachments'],
    queryFn: () => lessonsApi.attachments(lessonId),
  });

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

export default function CourseDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);

  const { data: course, isLoading: loadingCourse, error: courseError } = useQuery({
    queryKey: ['courses', id],
    queryFn: () => coursesApi.get(id),
  });
  const { data: lessons = [], isLoading: loadingLessons } = useQuery({
    queryKey: ['courses', id, 'lessons'],
    queryFn: () => lessonsApi.listByCourse(id),
  });
  const { data: tests = [], isLoading: loadingTests } = useQuery({
    queryKey: ['courses', id, 'tests'],
    queryFn: () => testsApi.listByCourse(id),
  });
  const { data: enrollment, isLoading: loadingEnrollment } = useQuery({
    queryKey: ['courses', id, 'enrollment'],
    queryFn: () => coursesApi.enrollment(id),
  });
  const { data: results = [], isLoading: loadingResults } = useQuery({
    queryKey: ['results', 'me'],
    queryFn: resultsApi.me,
  });
  const { data: completedIds, isLoading: loadingCompleted } = useQuery({
    queryKey: ['courses', id, 'lessons', 'completed'],
    queryFn: () => lessonsApi.completed(id),
  });

  const loading = loadingCourse || loadingLessons || loadingTests
    || loadingEnrollment || loadingResults || loadingCompleted;

  // Derivado directamente de las queries: la inscripción y las lecciones
  // completadas se actualizan de forma optimista escribiendo en la caché de
  // React Query (setQueryData), sin estado local ni efectos de sincronización.
  const isEnrolled = enrollment?.enrolled ?? false;
  const completedLessons = useMemo(() => new Set(completedIds ?? []), [completedIds]);

  // Mejor nota por test (derivada).
  const resultsByTestId = useMemo(() => {
    const testIds = new Set(tests.map(t => t.id));
    const map = {};
    results
      .filter(r => testIds.has(r.test_id))
      .forEach(r => {
        if (map[r.test_id] === undefined || r.score > map[r.test_id]) {
          map[r.test_id] = r.score;
        }
      });
    return map;
  }, [results, tests]);

  const enrollMutation = useMutation({
    mutationFn: () => coursesApi.enroll(id),
    onSuccess: () => {
      queryClient.setQueryData(['courses', id, 'enrollment'], { enrolled: true });
      queryClient.invalidateQueries({ queryKey: ['courses', 'enrolled'] });
    },
    onError: () => setError('No se pudo completar la inscripción.'),
  });
  const handleEnroll = () => enrollMutation.mutate();

  const completedKey = ['courses', id, 'lessons', 'completed'];
  const toggleLessonComplete = async (lessonId) => {
    const done = completedLessons.has(lessonId);
    const prev = completedIds ?? [];
    // Optimista: escribimos la caché para que la UI responda al instante.
    queryClient.setQueryData(completedKey, done ? prev.filter(x => x !== lessonId) : [...prev, lessonId]);
    try {
      if (done) await lessonsApi.uncomplete(lessonId);
      else await lessonsApi.complete(lessonId);
    } catch {
      queryClient.setQueryData(completedKey, prev); // revertir
      setError('No se pudo actualizar el progreso de la lección.');
    }
  };

  // Progreso combinado: lecciones completadas + tests realizados sobre el total.
  const completedTestsCount = Object.keys(resultsByTestId).length;
  const completedLessonsCount = lessons.filter(l => completedLessons.has(l.id)).length;
  const totalItems = lessons.length + tests.length;
  const completedItems = completedLessonsCount + completedTestsCount;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const allDone = totalItems > 0 && completedItems === totalItems;

  if (loading) return <Loading minHeight="50vh" />;

  if (courseError || error) {
    return (
      <div className="container">
        <Alert>{error || 'Error al cargar el curso.'}</Alert>
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

            {/* ── Progress strip (enrolled, with lessons o tests) ── */}
            {isEnrolled && totalItems > 0 && (
              <div className="course-progress">
                <div className="course-progress-meta">
                  <span className="course-progress-label">
                    {allDone
                      ? 'Curso completado'
                      : `${completedItems} de ${totalItems} completados`}
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
                disabled={enrollMutation.isPending}
              >
                {enrollMutation.isPending ? 'Inscribiéndose…' : 'Inscribirse'}
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
                    const done = completedLessons.has(lesson.id);
                    return (
                      <div key={lesson.id} className={`course-lesson ${open ? 'course-lesson--open' : ''} ${done ? 'course-lesson--done' : ''}`}>
                        <button
                          className="course-lesson-header"
                          onClick={() => setExpandedLesson(open ? null : lesson.id)}
                          aria-expanded={open}
                        >
                          <span className="course-lesson-number">{index + 1}</span>
                          <span className="course-lesson-title">{lesson.title}</span>
                          {done && <CheckCircle2 size={16} className="course-lesson-done-icon" />}
                          <ChevronDown size={16} className="course-lesson-chevron" />
                        </button>
                        <AnimatePresence initial={false}>
                          {open && (
                            <motion.div
                              key="body"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div className="course-lesson-body">
                                {lesson.content && <p>{lesson.content}</p>}
                                <LessonMedia lessonId={lesson.id} />
                                <button
                                  type="button"
                                  className={`lesson-complete-btn ${done ? 'lesson-complete-btn--done' : ''}`}
                                  onClick={() => toggleLessonComplete(lesson.id)}
                                >
                                  {done
                                    ? <><CheckCircle2 size={15} /> Completada</>
                                    : <><Circle size={15} /> Marcar como completada</>}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
              <EmptyState boxed message="Este curso no tiene contenido aún." />
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
