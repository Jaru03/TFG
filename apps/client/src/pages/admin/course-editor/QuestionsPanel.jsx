import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { adminApi } from '../../../api';
import Alert from '../../../components/Alert';
import Loading from '../../../components/Loading';
import PointsField from '../../../components/PointsField';
import InlineForm from './InlineForm';
import Collapse from './Collapse';
import { collapseTransition } from './anim';

const EMPTY_FORM = { question: '', optionA: '', optionB: '', optionC: '', correctOption: 'A', points: '' };

// Componente a nivel de módulo (no dentro del render) para que no se remonte
// en cada pulsación y los inputs no pierdan el foco.
function QuestionFields({ form, onChange }) {
  return (
    <>
      <div className="admin-lfield">
        <label>Pregunta</label>
        <input autoFocus value={form.question} onChange={e => onChange(f => ({ ...f, question: e.target.value }))} placeholder="Texto de la pregunta…" />
      </div>
      <div className="admin-form-row">
        <div className="admin-lfield"><label>Opción A</label><input value={form.optionA} onChange={e => onChange(f => ({ ...f, optionA: e.target.value }))} /></div>
        <div className="admin-lfield"><label>Opción B</label><input value={form.optionB} onChange={e => onChange(f => ({ ...f, optionB: e.target.value }))} /></div>
      </div>
      <div className="admin-form-row">
        <div className="admin-lfield"><label>Opción C</label><input value={form.optionC} onChange={e => onChange(f => ({ ...f, optionC: e.target.value }))} /></div>
        <div className="admin-lfield">
          <label>Correcta</label>
          <select value={form.correctOption} onChange={e => onChange(f => ({ ...f, correctOption: e.target.value }))}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
      </div>
      <div className="admin-lfield">
        <PointsField value={form.points} onChange={v => onChange(f => ({ ...f, points: v }))} />
      </div>
    </>
  );
}

export default function QuestionsPanel({ testId }) {
  const queryClient = useQueryClient();
  const [creating, setCreating]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newForm, setNewForm]     = useState(EMPTY_FORM);
  const [editForm, setEditForm]   = useState({});
  const [error, setError]         = useState(null);

  const questionsKey = ['admin', 'tests', testId, 'questions'];
  const { data: questions = [], isLoading: loading } = useQuery({
    queryKey: questionsKey,
    queryFn: () => adminApi.testQuestions(testId),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: questionsKey });

  const handleCreate = async () => {
    if (!newForm.question.trim()) return;
    try {
      await adminApi.createQuestion(testId, newForm);
      setNewForm(EMPTY_FORM);
      setCreating(false);
      invalidate();
    } catch (e) { setError(e.response?.data?.message || 'No se pudo crear la pregunta.'); }
  };

  const handleUpdate = async (id) => {
    try {
      await adminApi.updateQuestion(id, editForm);
      setEditingId(null);
      invalidate();
    } catch (e) { setError(e.response?.data?.message || 'No se pudo actualizar.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta pregunta?')) return;
    try {
      await adminApi.removeQuestion(id);
      invalidate();
    } catch { setError('No se pudo eliminar.'); }
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setCreating(false);
    setEditForm({ question: q.question, optionA: q.option_a, optionB: q.option_b, optionC: q.option_c, correctOption: q.correct_option, points: q.points ?? '' });
  };

  if (loading) return <Loading minHeight="50px" message="Cargando…" />;

  return (
    <div className="editor-questions-panel">
      <div className="editor-questions-header">
        <span className="editor-questions-label">Preguntas ({questions.length})</span>
        <button className="admin-add-btn" onClick={() => { setCreating(true); setEditingId(null); }}>
          <Plus size={12} /> Añadir
        </button>
      </div>

      {error && <Alert>{error}</Alert>}

      <Collapse show={creating}>
        <InlineForm onCancel={() => setCreating(false)} onSave={handleCreate} saveLabel="Guardar pregunta">
          <QuestionFields form={newForm} onChange={setNewForm} />
        </InlineForm>
      </Collapse>

      {questions.length === 0 && !creating && (
        <p className="editor-empty" style={{ textAlign: 'left', padding: '6px 0' }}>Sin preguntas todavía.</p>
      )}

      {questions.map((q, idx) => (
        <motion.div key={q.id} layout transition={{ layout: collapseTransition }} style={{ overflow: 'hidden' }}>
          {editingId === q.id ? (
            <motion.div layout="position">
              <InlineForm onCancel={() => setEditingId(null)} onSave={() => handleUpdate(q.id)}>
                <QuestionFields form={editForm} onChange={setEditForm} />
              </InlineForm>
            </motion.div>
          ) : (
            <motion.div layout="position" className="editor-question-item">
              <span className="editor-question-text">
                <strong style={{ color: 'var(--text-muted)', marginRight: 6 }}>{idx + 1}.</strong>
                {q.question}
              </span>
              <span className="editor-question-points">
                {q.effective_points} pts{q.points == null ? ' (auto)' : ''}
              </span>
              <span className="editor-question-answer">{q.correct_option}</span>
              <div className="admin-actions">
                <button className="admin-btn-icon edit" onClick={() => startEdit(q)} title="Editar"><Pencil size={12} /></button>
                <button className="admin-btn-icon" onClick={() => handleDelete(q.id)} title="Eliminar"><Trash2 size={12} /></button>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
