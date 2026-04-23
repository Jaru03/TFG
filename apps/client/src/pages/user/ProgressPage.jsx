import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, BookOpen, Award } from 'lucide-react';
import './UserPages.css';

export default function ProgressPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/results/me');
        setResults(res.data);
      } catch {
        setError('Error al cargar tu progreso.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byCourse = results.reduce((acc, r) => {
    if (!acc[r.course_title]) acc[r.course_title] = [];
    acc[r.course_title].push(r);
    return acc;
  }, {});

  const totalTests = results.length;
  const avgScore = totalTests > 0
    ? (results.reduce((sum, r) => sum + r.score, 0) / totalTests).toFixed(1)
    : 0;

  return (
    <main className="user-page">
      <div className="user-page-container">
        <div className="user-page-header">
          <h1>Mi progreso</h1>
          <p className="user-page-subtitle">Historial de tests completados</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <div className="user-page-loading">Cargando...</div>
        ) : (
          <>
            <div className="progress-stats">
              <div className="progress-stat-card">
                <CheckCircle size={24} className="progress-stat-icon green" />
                <div>
                  <span className="progress-stat-value">{totalTests}</span>
                  <span className="progress-stat-label">Tests completados</span>
                </div>
              </div>
              <div className="progress-stat-card">
                <Award size={24} className="progress-stat-icon blue" />
                <div>
                  <span className="progress-stat-value">{avgScore}</span>
                  <span className="progress-stat-label">Puntuación media</span>
                </div>
              </div>
              <div className="progress-stat-card">
                <BookOpen size={24} className="progress-stat-icon purple" />
                <div>
                  <span className="progress-stat-value">{Object.keys(byCourse).length}</span>
                  <span className="progress-stat-label">Cursos con actividad</span>
                </div>
              </div>
            </div>

            {totalTests === 0 ? (
              <div className="user-page-empty">
                <p>Aún no has completado ningún test.</p>
                <a href="/my-courses" className="user-page-link">Ver mis cursos</a>
              </div>
            ) : (
              <div className="progress-courses">
                {Object.entries(byCourse).map(([courseTitle, courseResults]) => (
                  <div key={courseTitle} className="progress-course-block">
                    <h2 className="progress-course-title">{courseTitle}</h2>
                    <div className="progress-results-list">
                      {courseResults.map((r) => (
                        <div key={r.id} className="progress-result-row">
                          <span className="progress-test-name">{r.test_title}</span>
                          <span className="progress-score">{r.score} pts</span>
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
