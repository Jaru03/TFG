import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { adminApi } from '../../../api';
import Alert from '../../../components/Alert';
import Loading from '../../../components/Loading';
import InlineForm from './InlineForm';
import Collapse from './Collapse';
import { collapseTransition } from './anim';
import QuestionsPanel from './QuestionsPanel';

export default function TestsPanel({ courseId, creating, onCreatingChange, onCountChange }) {
  const queryClient = useQueryClient();
  const [error, setError]           = useState(null);
  const [editingId, setEditingId]   = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [newForm, setNewForm]       = useState({ title: '', description: '', maxScore: '' });
  const [editForm, setEditForm]     = useState({});

  const testsKey = ['admin', 'courses', courseId, 'tests'];
  const { data: tests = [], isLoading: loading } = useQuery({
    queryKey: testsKey,
    queryFn: () => adminApi.courseTests(courseId),
  });
  useEffect(() => { onCountChange?.(tests.length); }, [tests, onCountChange]);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: testsKey });

  const handleCreate = async () => {
    if (!newForm.title.trim()) return;
    try {
      await adminApi.createTest(courseId, newForm);
      setNewForm({ title: '', description: '', maxScore: '' });
      onCreatingChange(false);
      invalidate();
    } catch (e) { setError(e.response?.data?.message || 'No se pudo crear el test.'); }
  };

  const handleUpdate = async (id) => {
    try {
      await adminApi.updateTest(id, editForm);
      setEditingId(null);
      invalidate();
    } catch (e) { setError(e.response?.data?.message || 'No se pudo actualizar.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este test y todas sus preguntas?')) return;
    try {
      await adminApi.removeTest(id);
      if (expandedId === id) setExpandedId(null);
      invalidate();
    } catch { setError('No se pudo eliminar.'); }
  };

  const startEdit = (test) => {
    setEditingId(test.id);
    onCreatingChange(false);
    setEditForm({ title: test.title, description: test.description || '', maxScore: test.max_score });
  };

  if (loading) return <Loading minHeight="60px" message="Cargando tests…" />;

  return (
    <div>
      {error && <Alert>{error}</Alert>}

      <Collapse show={creating}>
        <InlineForm onCancel={() => onCreatingChange(false)} onSave={handleCreate} saveLabel="Guardar test">
          <div className="admin-form-row">
            <div className="admin-lfield">
              <label>Título</label>
              <input autoFocus value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))} placeholder="Título del test" />
            </div>
            <div className="admin-lfield">
              <label>Descripción</label>
              <input value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} placeholder="Opcional" />
            </div>
            <div className="admin-lfield">
              <label>Valor (pts)</label>
              <input type="number" min="0.01" step="0.01" value={newForm.maxScore} onChange={e => setNewForm(f => ({ ...f, maxScore: e.target.value }))} placeholder="10" />
            </div>
          </div>
        </InlineForm>
      </Collapse>

      {tests.length === 0 && !creating ? (
        <p className="editor-empty">Sin tests todavía.</p>
      ) : (
        <ul className="editor-list">
          {tests.map(test => (
            <motion.li key={test.id} layout transition={{ layout: collapseTransition }} style={{ overflow: 'hidden' }}>
              {editingId === test.id ? (
                <motion.div layout="position">
                  <InlineForm onCancel={() => setEditingId(null)} onSave={() => handleUpdate(test.id)}>
                    <div className="admin-form-row">
                      <div className="admin-lfield">
                        <label>Título</label>
                        <input autoFocus value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                      </div>
                      <div className="admin-lfield">
                        <label>Descripción</label>
                        <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                      </div>
                      <div className="admin-lfield">
                        <label>Valor (pts)</label>
                        <input type="number" min="0.01" step="0.01" value={editForm.maxScore} onChange={e => setEditForm(f => ({ ...f, maxScore: e.target.value }))} />
                      </div>
                    </div>
                  </InlineForm>
                </motion.div>
              ) : (
                <motion.div layout="position">
                  <div
                    className="editor-item editor-item--clickable"
                    onClick={() => setExpandedId(expandedId === test.id ? null : test.id)}
                  >
                    <span className="admin-expand-btn">
                      {expandedId === test.id ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </span>
                    <div className="editor-item-body">
                      <div className="editor-item-title">{test.title}</div>
                      {test.description && <div className="editor-item-sub">{test.description}</div>}
                    </div>
                    <div className="admin-actions">
                      <button className="admin-btn-icon edit" onClick={e => { e.stopPropagation(); startEdit(test); }} title="Editar"><Pencil size={14} /></button>
                      <button className="admin-btn-icon" onClick={e => { e.stopPropagation(); handleDelete(test.id); }} title="Eliminar"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {expandedId === test.id && (
                    <motion.div layout="position">
                      <QuestionsPanel testId={test.id} />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
