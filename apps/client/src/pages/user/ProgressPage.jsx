import { useQuery } from '@tanstack/react-query';
import { resultsApi, coursesApi } from '../../api';
import { CheckCircle, Award, GraduationCap } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Alert from '../../components/Alert';
import './UserPages.css';

export default function ProgressPage() {
  const { data: results = [], isLoading: loadingResults, error: errorResults } = useQuery({
    queryKey: ['results', 'me'],
    queryFn: resultsApi.me,
  });
  const { data: enrolledCourses = [], isLoading: loadingCourses, error: errorCourses } = useQuery({
    queryKey: ['courses', 'enrolled'],
    queryFn: coursesApi.enrolled,
  });

  const loading = loadingResults || loadingCourses;
  const error = errorResults || errorCourses;
  const lessonsCompleted = enrolledCourses.reduce((sum, c) => sum + (c.completed_lessons || 0), 0);

  // Nos quedamos con el MEJOR intento de cada test (no todos los intentos).
  const bestByTest = {};
  for (const r of results) {
    const score = Number(r.score);
    const cur = bestByTest[r.test_id];
    if (!cur || score > Number(cur.score)) bestByTest[r.test_id] = r;
  }
  const bestResults = Object.values(bestByTest);

  const byCourse = bestResults.reduce((acc, r) => {
    if (!acc[r.course_title]) acc[r.course_title] = [];
    acc[r.course_title].push(r);
    return acc;
  }, {});

  const totalTests = bestResults.length;
  const avgScore = totalTests > 0
    ? (bestResults.reduce((sum, r) => sum + Number(r.score), 0) / totalTests).toFixed(1)
    : 0;

  return (
    <main className="user-page">
      <div className="user-page-container">
        <div className="user-page-header">
          <h1>Mi progreso</h1>
          <p className="user-page-subtitle">Historial de tests completados</p>
        </div>

        {error && <Alert>Error al cargar tu progreso.</Alert>}
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="progress-stats">
              <StatCard icon={<CheckCircle size={18} />}   value={totalTests}       label="Tests completados"     iconBg="#dcfce7" iconColor="#16a34a" />
              <StatCard icon={<GraduationCap size={18} />} value={lessonsCompleted} label="Lecciones completadas" iconBg="#fef3c7" iconColor="#d97706" />
              <StatCard icon={<Award size={18} />}         value={avgScore}         label="Puntuación media"      iconBg="#eef2ff" iconColor="#6366f1" />
            </div>

            {totalTests === 0 ? (
              <EmptyState
                message="Aún no has completado ningún test."
                action={<a href="/my-courses" className="user-page-link">Ver mis cursos</a>}
              />
            ) : (
              <div className="progress-courses">
                {Object.entries(byCourse).map(([courseTitle, courseResults]) => (
                  <div key={courseTitle} className="progress-course-block">
                    <h2 className="progress-course-title">{courseTitle}</h2>
                    <div className="progress-results-list">
                      {courseResults.map((r) => (
                        <div key={r.id} className="progress-result-row">
                          <span className="progress-test-name">{r.test_title}</span>
                          <span className="progress-score">{Number(r.score)} pts</span>
                          <span className="progress-date">
                            {new Date(r.completed_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
