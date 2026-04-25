import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Pencil, Trash2, Check } from 'lucide-react';
import './TestManagePage.css';

const EMPTY_FORM = { question: '', optionA: '', optionB: '', optionC: '', correctOption: 'A' };

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
        <textarea
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
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const [testRes, qRes] = await Promise.all([
        axios.get(`/api/tests/${testId}`),
        axios.get(`/api/tests/${testId}/questions`),
      ]);
      setTest(testRes.data);
      setQuestions(qRes.data);
    } catch {
      setError('No se pudo cargar el test.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [testId]);

  const handleCreate = async (form) => {
    await axios.post(`/api/tests/${testId}/questions`, form);
    setCreating(false);
    load();
  };

  const handleEdit = async (form, questionId) => {
    await axios.put(`/api/tests/${testId}/questions/${questionId}`, form);
    setEditingId(null);
    load();
  };

  const handleDelete = async (questionId) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    try {
      await axios.delete(`/api/tests/${testId}/questions/${questionId}`);
      load();
    } catch {
      setError('No se pudo eliminar la pregunta.');
    }
  };

  if (loading) return <div className="tmanage-loading">Cargando…</div>;

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
          <span className="tmanage-badge">{questions.length} pregunta{questions.length !== 1 ? 's' : ''}</span>
        </div>

        {error && <div className="tmanage-alert">{error}</div>}

        {/* Create form */}
        {creating && (
          <div className="tmanage-card tmanage-card--form">
            <p className="tmanage-form-label">Nueva pregunta</p>
            <QuestionForm
              onSave={handleCreate}
              onCancel={() => setCreating(false)}
            />
          </div>
        )}

        {/* Questions list */}
        {questions.length === 0 && !creating ? (
          <div className="tmanage-empty">
            <p>No hay preguntas todavía.</p>
            <button className="tmanage-add-btn" onClick={() => setCreating(true)}>
              <Plus size={15} /> Añadir primera pregunta
            </button>
          </div>
        ) : (
          <div className="tmanage-list">
            {questions.map((q, idx) => (
              <div key={q.id} className={`tmanage-card ${editingId === q.id ? 'tmanage-card--editing' : ''}`}>
                {editingId === q.id ? (
                  <>
                    <p className="tmanage-form-label">Editando pregunta {idx + 1}</p>
                    <QuestionForm
                      initial={{
                        question: q.question,
                        optionA: q.option_a,
                        optionB: q.option_b,
                        optionC: q.option_c,
                        correctOption: q.correct_option,
                      }}
                      onSave={(form) => handleEdit(form, q.id)}
                      onCancel={() => setEditingId(null)}
                    />
                  </>
                ) : (
                  <QuestionCard
                    q={q}
                    index={idx}
                    onEdit={() => { setEditingId(q.id); setCreating(false); }}
                    onDelete={() => handleDelete(q.id)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
