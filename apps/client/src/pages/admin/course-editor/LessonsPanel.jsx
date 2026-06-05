import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { adminApi } from '../../../api';
import Alert from '../../../components/Alert';
import Loading from '../../../components/Loading';
import AutoTextarea from '../../../components/AutoTextarea';
import InlineForm from './InlineForm';
import Collapse from './Collapse';
import { collapseTransition } from './anim';

export default function LessonsPanel({ courseId, creating, onCreatingChange, onCountChange }) {
  const queryClient = useQueryClient();
  const [error, setError]         = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newForm, setNewForm]     = useState({ title: '', content: '' });
  const [editForm, setEditForm]   = useState({});

  const lessonsKey = ['admin', 'courses', courseId, 'lessons'];
  const { data: lessons = [], isLoading: loading } = useQuery({
    queryKey: lessonsKey,
    queryFn: () => adminApi.courseLessons(courseId),
  });
  useEffect(() => { onCountChange?.(lessons.length); }, [lessons, onCountChange]);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: lessonsKey });

  const handleCreate = async () => {
    if (!newForm.title.trim()) return;
    try {
      await adminApi.createLesson(courseId, {
        title: newForm.title, content: newForm.content, orderNumber: lessons.length + 1,
      });
      setNewForm({ title: '', content: '' });
      onCreatingChange(false);
      invalidate();
    } catch { setError('No se pudo crear la lección.'); }
  };

  const handleUpdate = async (id) => {
    try {
      await adminApi.updateLesson(id, editForm);
      setEditingId(null);
      invalidate();
    } catch { setError('No se pudo actualizar.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta lección?')) return;
    try {
      await adminApi.removeLesson(id);
      invalidate();
    } catch { setError('No se pudo eliminar.'); }
  };

  const startEdit = (lesson) => {
    setEditingId(lesson.id);
    onCreatingChange(false);
    setEditForm({ title: lesson.title, content: lesson.content || '', orderNumber: lesson.order_number });
  };

  if (loading) return <Loading minHeight="60px" message="Cargando lecciones…" />;

  return (
    <div>
      {error && <Alert>{error}</Alert>}

      <Collapse show={creating}>
        <InlineForm onCancel={() => onCreatingChange(false)} onSave={handleCreate} saveLabel="Guardar lección">
          <div className="admin-lfield">
            <label>Título</label>
            <input autoFocus value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))} placeholder="Título de la lección" />
          </div>
          <div className="admin-lfield">
            <label>Contenido</label>
            <AutoTextarea rows={3} value={newForm.content} onChange={e => setNewForm(f => ({ ...f, content: e.target.value }))} placeholder="Texto o URL de vídeo…" />
          </div>
        </InlineForm>
      </Collapse>

      {lessons.length === 0 && !creating ? (
        <p className="editor-empty">Sin lecciones todavía.</p>
      ) : (
        <ul className="editor-list">
          {lessons.map(lesson => (
            <motion.li key={lesson.id} layout transition={{ layout: collapseTransition }} style={{ overflow: 'hidden' }}>
              {editingId === lesson.id ? (
                <motion.div layout="position">
                  <InlineForm onCancel={() => setEditingId(null)} onSave={() => handleUpdate(lesson.id)}>
                    <div className="admin-inline-row">
                      <div className="admin-lfield" style={{ width: 64, flexShrink: 0 }}>
                        <label>#</label>
                        <input type="number" value={editForm.orderNumber} onChange={e => setEditForm(f => ({ ...f, orderNumber: parseInt(e.target.value) }))} />
                      </div>
                      <div className="admin-lfield">
                        <label>Título</label>
                        <input autoFocus value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                      </div>
                    </div>
                    <div className="admin-lfield">
                      <label>Contenido</label>
                      <AutoTextarea rows={2} value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} />
                    </div>
                  </InlineForm>
                </motion.div>
              ) : (
                <motion.div layout="position" className="editor-item">
                  <span className="editor-item-num">{lesson.order_number}</span>
                  <span className="editor-item-dot" />
                  <div className="editor-item-body">
                    <div className="editor-item-title">{lesson.title}</div>
                    {lesson.content && <div className="editor-item-sub">{lesson.content}</div>}
                  </div>
                  <div className="admin-actions">
                    <button className="admin-btn-icon edit" onClick={() => startEdit(lesson)} title="Editar"><Pencil size={14} /></button>
                    <button className="admin-btn-icon" onClick={() => handleDelete(lesson.id)} title="Eliminar"><Trash2 size={14} /></button>
                  </div>
                </motion.div>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
