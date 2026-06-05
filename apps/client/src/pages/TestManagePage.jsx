import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { testsApi } from '../api';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Plus, Pencil, Trash2, Check } from 'lucide-react';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import PointsField from '../components/PointsField';
import AutoTextarea from '../components/AutoTextarea';
import './TestManagePage.css';

const EMPTY_FORM = { question: '', optionA: '', optionB: '', optionC: '', correctOption: 'A', points: '' };

// ── Correct-option toggle ───────────────────────────────────────────────────
function CorrectToggle({ value, onChange }) {
  return (
    <div className="correct-toggle">
      <span className="correct-toggle-label">Respuesta correcta</span>
      <div className="correct-toggle-btns">
        {['A', 'B', 'C'].map(l => (
          <button
            key={l}
            type="button"
            className={`correct-toggle-btn ${value === l ? 'correct-toggle-btn--on' : ''}`}
            onClick={() => onChange(l)}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Question form (create + edit) ───────────────────────────────────────────
function QuestionForm({ initial = EMPTY_FORM, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim()) { setError('El enunciado es obligatorio.'); return; }
    if (!form.optionA.trim() || !form.optionB.trim() || !form.optionC.trim()) {
      setError('Las tres opciones son obligatorias.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch {
      setError('No se pudo guardar la pregunta.');
      setSaving(false);
    }
  };

  return (
    <form className="qform" onSubmit={handleSubmit}>
      {error && <p className="qform-error">{error}</p>}

      <div className="qform-row">
        <label>Enunciado</label>
        <AutoTextarea
          rows={3}
          placeholder="Escribe la pregunta…"
          value={form.question}
          onChange={set('question')}
          autoFocus
        />
      </div>

      <div className="qform-options">
        {[['A', 'optionA'], ['B', 'optionB'], ['C', 'optionC']].map(([letter, key]) => (
          <div key={key} className="qform-option">
            <span className="qform-option-badge">{letter}</span>
            <input
              type="text"
              placeholder={`Opción ${letter}`}
              value={form[key]}
              onChange={set(key)}
            />
          </div>
        ))}
      </div>

      <CorrectToggle value={form.correctOption} onChange={v => setForm(p => ({ ...p, correctOption: v }))} />

      <PointsField value={form.points} onChange={v => setForm(p => ({ ...p, points: v }))} />

      <div className="qform-actions">
        <button type="button" className="qform-btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="qform-btn-primary" disabled={saving}>
          {saving ? 'Guardando…' : <><Check size={14} /> Guardar</>}
        </button>
      </div>
    </form>
  );
}

// ── Question card (view mode) ───────────────────────────────────────────────
function QuestionCard({ q, index, onEdit, onDelete }) {
  const options = [
    { letter: 'A', text: q.option_a },
    { letter: 'B', text: q.option_b },
    { letter: 'C', text: q.option_c },
  ];

  return (
    <div className="qcard">
      <div className="qcard-top">
        <span className="qcard-num">{index + 1}</span>
        <p className="qcard-question">{q.question}</p>
        <span className={`qcard-points ${q.points != null ? 'qcard-points--custom' : ''}`}>
          {q.effective_points} pts{q.points == null ? ' (auto)' : ''}
        </span>
        <div className="qcard-actions">
          <button className="qcard-icon-btn" title="Editar" onClick={onEdit}>
            <Pencil size={14} />
          </button>
          <button className="qcard-icon-btn qcard-icon-btn--danger" title="Eliminar" onClick={onDelete}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="qcard-options">
        {options.map(({ letter, text }) => (
          <span
            key={letter}
            className={`qcard-option ${q.correct_option === letter ? 'qcard-option--correct' : ''}`}
          >
            <span className="qcard-option-letter">{letter}</span>
            {text}
            {q.correct_option === letter && <Check size={12} className="qcard-check" />}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function TestManagePage() {
  const { id: testId } = useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState(false);
  const [valueInput, setValueInput] = useState('');

  const testKey = ['tests', testId];
  const questionsKey = ['tests', testId, 'questions'];

  const { data: test, isLoading: loadingTest, error: loadError } = useQuery({
    queryKey: testKey,
    queryFn: () => testsApi.get(testId),
  });
  const { data: questions = [], isLoading: loadingQuestions } = useQuery({
    queryKey: questionsKey,
    queryFn: () => testsApi.questions(testId),
  });
  const loading = loadingTest || loadingQuestions;

  // El valor del test reparte puntos entre las preguntas, así que al cambiar
  // cualquiera de los dos se invalidan ambas queries.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: testKey });
    queryClient.invalidateQueries({ queryKey: questionsKey });
  };

  const saveTestValue = async () => {
    try {
      await testsApi.update(testId, {
        title: test.title,
        description: test.description,
        maxScore: valueInput,
      });
      setEditingValue(false);
      invalidate();
    } catch (e) {
      setError(e.response?.data?.message || 'No se pudo actualizar el valor del test.');
    }
  };

  const handleCreate = async (form) => {
    await testsApi.createQuestion(testId, form);
    setCreating(false);
    invalidate();
  };

  const handleEdit = async (form, questionId) => {
    await testsApi.updateQuestion(testId, questionId, form);
    setEditingId(null);
    invalidate();
  };

  const handleDelete = async (questionId) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    try {
      await testsApi.removeQuestion(testId, questionId);
      invalidate();
    } catch {
      setError('No se pudo eliminar la pregunta.');
    }
  };

  if (loading) return <Loading minHeight="40vh" />;

  return (
    <div className="tmanage-shell">
      <div className="tmanage-container">

        {/* Top bar */}
        <div className="tmanage-topbar">
          {test?.course_id && (
            <Link to={`/courses/${test.course_id}`} className="tmanage-back">
              <ArrowLeft size={15} />
              Volver al curso
            </Link>
          )}
          {!creating && (
            <button
              className="tmanage-add-btn"
              onClick={() => { setCreating(true); setEditingId(null); }}
            >
              <Plus size={15} />
              Nueva pregunta
            </button>
          )}
        </div>

        {/* Header */}
        <div className="tmanage-header">
          <h1>{test?.title}</h1>
          {test?.description && <p className="tmanage-desc">{test.description}</p>}
          <div className="tmanage-meta">
            <span className="tmanage-badge">{questions.length} pregunta{questions.length !== 1 ? 's' : ''}</span>
            {!editingValue ? (
              <button
                className="tmanage-value"
                onClick={() => { setValueInput(Number(test.max_score)); setEditingValue(true); }}
                title="Editar el valor total del test"
              >
                Valor: {Number(test?.max_score)} pts <Pencil size={12} />
              </button>
            ) : (
              <span className="tmanage-value-edit">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={valueInput}
                  onChange={e => setValueInput(e.target.value)}
                  autoFocus
                />
                <button className="tmanage-value-save" onClick={saveTestValue}>Guardar</button>
                <button className="tmanage-value-cancel" onClick={() => setEditingValue(false)}>Cancelar</button>
              </span>
            )}
          </div>
        </div>

        {(error || loadError) && <Alert>{error || 'No se pudo cargar el test.'}</Alert>}

        {/* Create form */}
        <AnimatePresence initial={false}>
          {creating && (
            <motion.div
              className="tmanage-card tmanage-card--form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <p className="tmanage-form-label">Nueva pregunta</p>
              <QuestionForm
                onSave={handleCreate}
                onCancel={() => setCreating(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Questions list */}
        {questions.length === 0 && !creating ? (
          <EmptyState
            boxed
            message="No hay preguntas todavía."
            action={(
              <button className="tmanage-add-btn" onClick={() => setCreating(true)}>
                <Plus size={15} /> Añadir primera pregunta
              </button>
            )}
          />
        ) : (
          <motion.div
            className="tmanage-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {questions.map((q, idx) => (
              <motion.div
                key={q.id}
                layout
                transition={{ layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
                style={{ borderRadius: '0.625rem' }}
                className={`tmanage-card ${editingId === q.id ? 'tmanage-card--editing' : ''}`}
              >
                {editingId === q.id ? (
                  <motion.div
                    layout="position"
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.08 }}
                  >
                    <p className="tmanage-form-label">Editando pregunta {idx + 1}</p>
                    <QuestionForm
                      initial={{
                        question: q.question,
                        optionA: q.option_a,
                        optionB: q.option_b,
                        optionC: q.option_c,
                        correctOption: q.correct_option,
                        points: q.points ?? '',
                      }}
                      onSave={(form) => handleEdit(form, q.id)}
                      onCancel={() => setEditingId(null)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    layout="position"
                    key="view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.08 }}
                  >
                    <QuestionCard
                      q={q}
                      index={idx}
                      onEdit={() => { setEditingId(q.id); setCreating(false); }}
                      onDelete={() => handleDelete(q.id)}
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
