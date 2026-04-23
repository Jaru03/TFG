import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, XCircle, Check, X } from 'lucide-react';
import './TestViewPage.css';

const PAGE_SIZE = 10;

// ── Helpers ────────────────────────────────────────────────────────────────
function scoreLabel(pct) {
  if (pct >= 80) return 'Excelente trabajo';
  if (pct >= 60) return 'Buen resultado';
  if (pct >= 40) return 'Puedes mejorar';
  return 'Sigue practicando';
}
function scoreClass(pct) {
  if (pct >= 80) return 'result--great';
  if (pct >= 60) return 'result--good';
  if (pct >= 40) return 'result--fair';
  return 'result--low';
}

// ── Review: one question ───────────────────────────────────────────────────
function ReviewQuestion({ d, index }) {
  const opts = [['A', d.optionA], ['B', d.optionB], ['C', d.optionC]];
  return (
    <div className={`review-q ${d.correct ? 'review-q--ok' : 'review-q--wrong'}`}>
      <div className="review-q-header">
        <span className={`review-q-num ${d.correct ? 'rnum--ok' : 'rnum--wrong'}`}>
          {index + 1}
        </span>
        <p className="review-q-text">{d.question}</p>
        {d.correct
          ? <CheckCircle2 size={18} className="review-status ok" />
          : <XCircle     size={18} className="review-status wrong" />}
      </div>

      <div className="review-options">
        {opts.map(([letter, text]) => {
          const isCorrect  = d.correctOption === letter;
          const isSelected = d.yourAnswer    === letter;
          const cls =
            isSelected && isCorrect  ? 'ropt--selected-ok'   :
            isSelected && !isCorrect ? 'ropt--selected-wrong' :
            isCorrect                ? 'ropt--missed-correct' : '';
          return (
            <div key={letter} className={`review-option ${cls}`}>
              <span className="ropt-badge">{letter}</span>
              <span className="ropt-text">{text}</span>
              {isSelected && isCorrect  && <Check size={13} className="ropt-icon" />}
              {isSelected && !isCorrect && <X     size={13} className="ropt-icon" />}
              {!isSelected && isCorrect && <Check size={13} className="ropt-icon ropt-icon--hint" />}
            </div>
          );
        })}
      </div>

      {!d.correct && d.yourAnswer && (
        <p className="review-hint">
          Respuesta correcta: <strong>{d.correctOption}</strong>
        </p>
      )}
      {!d.yourAnswer && (
        <p className="review-hint review-hint--skipped">Sin responder</p>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function TestViewPage() {
  const { id } = useParams();
  const [test, setTest]           = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]     = useState({});
  const [result, setResult]       = useState(null);
  const [page, setPage]           = useState(0);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [testRes, qRes] = await Promise.all([
          axios.get(`/api/tests/${id}`),
          axios.get(`/api/tests/${id}/questions`),
        ]);
        setTest(testRes.data);
        setQuestions(qRes.data);
      } catch {
        setError('No se pudo cargar el test.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const totalPages    = Math.ceil(questions.length / PAGE_SIZE);
  const isMultiPage   = questions.length > PAGE_SIZE;
  const isLastPage    = page === totalPages - 1;
  const pageQuestions = useMemo(
    () => questions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [questions, page]
  );

  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers]
  );
  const progressPct = questions.length > 0
    ? Math.round((answeredCount / questions.length) * 100) : 0;

  const handleSelect = (questionId, letter) =>
    setAnswers(prev => ({ ...prev, [questionId]: letter }));

  const handleNext = () => {
    setPage(p => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handlePrev = () => {
    setPage(p => p - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        answers: questions.map(q => ({ questionId: q.id, answer: answers[q.id] || '' })),
      };
      const res = await axios.post(`/api/results/tests/${id}/submit`, payload);
      setResult(res.data);
      setShowReview(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Error al enviar el test. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / Error ──
  if (loading) return <div className="test-shell"><div className="test-loading">Cargando test…</div></div>;
  if (error && !test) return <div className="test-shell"><div className="test-error">{error}</div></div>;

  const pct = result ? Math.round((result.score / result.total) * 100) : 0;
  const wrongCount = result ? result.details.filter(d => !d.correct).length : 0;

  // ── Result screen ──
  if (result) {
    return (
      <div className="test-shell">
        {test?.course_id && (
          <div className="test-back-bar">
            <Link to={`/courses/${test.course_id}`} className="test-back-link">
              <ArrowLeft size={15} /> Volver al curso
            </Link>
          </div>
        )}
        <div className="test-container">

          {/* Score card */}
          <div className={`test-result ${scoreClass(pct)}`}>
            <div className="result-score-wrap">
              <span className="result-fraction">
                {result.score}<span className="result-total"> / {result.total}</span>
              </span>
              <span className="result-pct">{pct}%</span>
            </div>
            <div className="result-bar-track">
              <div className="result-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="result-label">{scoreLabel(pct)}</p>

            <div className="result-meta">
              <span className="result-meta-item result-meta-ok">
                <CheckCircle2 size={14} /> {result.score} correctas
              </span>
              {wrongCount > 0 && (
                <span className="result-meta-item result-meta-wrong">
                  <XCircle size={14} /> {wrongCount} incorrectas
                </span>
              )}
            </div>

            <div className="result-actions">
              <Link to={`/courses/${test.course_id}`} className="result-btn-primary">
                Volver al curso
              </Link>
              <button
                className="result-btn-secondary"
                onClick={() => setShowReview(v => !v)}
              >
                {showReview ? 'Ocultar revisión' : 'Ver mis respuestas'}
              </button>
              <button
                className="result-btn-ghost"
                onClick={() => { setResult(null); setAnswers({}); setPage(0); window.scrollTo({ top: 0 }); }}
              >
                Reintentar
              </button>
            </div>
          </div>

          {/* Review section */}
          {showReview && (
            <div className="review-section">
              <h2 className="review-heading">Revisión de respuestas</h2>
              <div className="review-list">
                {result.details.map((d, idx) => (
                  <ReviewQuestion key={d.questionId} d={d} index={idx} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Test screen ──
  return (
    <div className="test-shell">
      {test?.course_id && (
        <div className="test-back-bar">
          <Link to={`/courses/${test.course_id}`} className="test-back-link">
            <ArrowLeft size={15} /> Volver al curso
          </Link>
        </div>
      )}
      <div className="test-container">
        <header className="test-header">
          <h1>{test.title}</h1>
          {test.description && <p className="test-description">{test.description}</p>}
        </header>

        {/* Global progress */}
        <div className="test-progress">
          <div className="test-progress-meta">
            <span>{answeredCount} de {questions.length} respondidas</span>
            {isMultiPage && (
              <span className="test-page-indicator">
                Parte {page + 1} de {totalPages}
              </span>
            )}
            <span>{progressPct}%</span>
          </div>
          <div className="test-progress-track">
            <div className="test-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="test-empty">Este test no tiene preguntas todavía.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Page range label */}
            {isMultiPage && (
              <p className="test-range-label">
                Preguntas {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, questions.length)}
              </p>
            )}

            <div className="test-questions">
              {pageQuestions.map((q, idx) => {
                const globalIdx = page * PAGE_SIZE + idx;
                return (
                  <div key={q.id} className="test-question">
                    <p className="test-question-text">
                      <span className="test-question-num">{globalIdx + 1}.</span>
                      {q.question}
                    </p>
                    <div className="test-options">
                      {[['A', q.option_a], ['B', q.option_b], ['C', q.option_c]]
                        .filter(([, text]) => text)
                        .map(([letter, text]) => (
                          <button
                            key={letter}
                            type="button"
                            className={`test-option ${answers[q.id] === letter ? 'test-option--selected' : ''}`}
                            onClick={() => handleSelect(q.id, letter)}
                          >
                            <span className="test-option-badge">{letter}</span>
                            <span className="test-option-text">{text}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {error && <p className="test-submit-error">{error}</p>}

            <div className="test-footer">
              {isMultiPage && page > 0 && (
                <button type="button" className="test-nav-btn" onClick={handlePrev}>
                  ← Anterior
                </button>
              )}
              <span className="test-footer-gap" />
              {!isLastPage ? (
                <button type="button" className="test-next-btn" onClick={handleNext}>
                  Siguiente →
                </button>
              ) : (
                <div className="test-submit-wrap">
                  {answeredCount < questions.length && (
                    <p className="test-unanswered">
                      {questions.length - answeredCount} sin responder
                    </p>
                  )}
                  <button type="submit" className="test-submit-btn" disabled={submitting}>
                    {submitting ? 'Enviando…' : 'Enviar respuestas'}
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
