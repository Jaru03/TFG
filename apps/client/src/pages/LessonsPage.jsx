import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonsApi } from '../api';
import { isTeacher } from '../lib/roles';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, Pencil, X,
  ImageIcon, FileVideo, FileText, Link2, Upload, Check,
} from 'lucide-react';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import AutoTextarea from '../components/AutoTextarea';
import './LessonsPage.css';

// ── Helpers ────────────────────────────────────────────────────────────────

function AttachmentChip({ a, onDelete }) {
  const icons = {
    image: <ImageIcon size={13} />,
    video: <FileVideo size={13} />,
    video_url: <Link2 size={13} />,
    file: <FileText size={13} />,
  };
  const label = a.original_name || (a.type === 'video_url' ? 'Vídeo' : a.type);
  return (
    <span className="attachment-chip">
      {icons[a.type]}
      <span className="attachment-chip-label">{label}</span>
      {onDelete && (
        <button type="button" className="attachment-chip-remove" onClick={() => onDelete(a.id)}>
          <X size={11} />
        </button>
      )}
    </span>
  );
}

// ── Lesson Form (shared by create + edit) ──────────────────────────────────

function LessonForm({ initial = {}, lessonId, onSave, onCancel, onComplete }) {
  const [title, setTitle] = useState(initial.title || '');
  const [content, setContent] = useState(initial.content || '');
  const [videoUrl, setVideoUrl] = useState('');
  const [attachments, setAttachments] = useState(initial.attachments || []);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPendingFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removePending = (idx) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const deleteExisting = async (attachmentId) => {
    try {
      await lessonsApi.removeAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch {
      setError('No se pudo eliminar el adjunto.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('El título es obligatorio.'); return; }
    setSaving(true);
    setError(null);
    try {
      const saved = await onSave({ title, content, lessonId });
      const id = saved.id;

      for (const file of pendingFiles) {
        const fd = new FormData();
        fd.append('file', file);
        await lessonsApi.addAttachment(id, fd);
      }

      if (videoUrl.trim()) {
        await lessonsApi.addAttachment(id, { videoUrl: videoUrl.trim() });
      }

      // All done — tell parent to close and refresh
      onComplete(id);
    } catch (err) {
      setSaving(false);
      const msg = err.response?.data?.message || err.message || 'Error desconocido';
      setError(`Error: ${msg}`);
    }
  };

  return (
    <form className="lesson-form" onSubmit={handleSubmit}>
      {error && <p className="lesson-form-error">{error}</p>}

      <div className="lesson-form-row">
        <label>Título</label>
        <input
          type="text"
          placeholder="Título de la lección"
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      <div className="lesson-form-row">
        <label>Contenido</label>
        <AutoTextarea
          placeholder="Describe el contenido de la lección…"
          rows={4}
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </div>

      {/* Media section */}
      <div className="lesson-form-media">
        <span className="lesson-form-media-label">Multimedia</span>

        {/* Existing attachments */}
        {attachments.length > 0 && (
          <div className="lesson-form-chips">
            {attachments.map(a => (
              <AttachmentChip key={a.id} a={a} onDelete={deleteExisting} />
            ))}
          </div>
        )}

        {/* Pending files */}
        {pendingFiles.length > 0 && (
          <div className="lesson-form-chips">
            {pendingFiles.map((f, i) => (
              <span key={i} className="attachment-chip attachment-chip--pending">
                <FileText size={13} />
                <span className="attachment-chip-label">{f.name}</span>
                <button type="button" className="attachment-chip-remove" onClick={() => removePending(i)}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="lesson-form-media-actions">
          <button type="button" className="lesson-media-btn" onClick={() => fileRef.current.click()}>
            <Upload size={14} />
            Añadir archivos
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <div className="lesson-media-url-row">
            <Link2 size={14} className="lesson-media-url-icon" />
            <input
              type="url"
              placeholder="URL de YouTube o Vimeo"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="lesson-media-url-input"
            />
          </div>
        </div>
      </div>

      <div className="lesson-form-actions">
        <button type="button" className="lesson-btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="lesson-btn-primary" disabled={saving}>
          {saving ? 'Guardando…' : (
            <><Check size={15} /> Guardar</>
          )}
        </button>
      </div>
    </form>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function LessonsPage({ user }) {
  const { id: courseId } = useParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [lessonAttachments, setLessonAttachments] = useState({});

  const isProfessor = isTeacher(user);

  const lessonsKey = ['courses', courseId, 'lessons'];
  const { data: lessons = [], isLoading: loading, error: loadError } = useQuery({
    queryKey: lessonsKey,
    queryFn: () => lessonsApi.listByCourse(courseId),
  });
  const reloadLessons = () => queryClient.invalidateQueries({ queryKey: lessonsKey });

  const fetchAttachments = async (lessonId) => {
    if (lessonAttachments[lessonId]) return lessonAttachments[lessonId];
    try {
      const data = await lessonsApi.attachments(lessonId);
      setLessonAttachments(prev => ({ ...prev, [lessonId]: data }));
      return data;
    } catch { return []; }
  };

  const handleCreate = ({ title, content }) => lessonsApi.create(courseId, { title, content });

  const handleEdit = ({ title, content, lessonId }) => {
    const lesson = lessons.find(l => l.id === lessonId);
    return lessonsApi.update(lessonId, {
      title,
      content,
      orderNumber: lesson?.order_number || 1,
    });
  };

  const handleFormComplete = async (lessonId) => {
    setCreating(false);
    setEditingId(null);
    await reloadLessons();
    try {
      const data = await lessonsApi.attachments(lessonId);
      setLessonAttachments(prev => ({ ...prev, [lessonId]: data }));
    } catch { /* tabla aún no creada o sin adjuntos */ }
  };

  const handleDelete = async (lessonId) => {
    if (!confirm('¿Eliminar esta lección?')) return;
    try {
      await lessonsApi.remove(lessonId);
      await reloadLessons();
    } catch {
      setError('No se pudo eliminar la lección.');
    }
  };

  const startEdit = async (lesson) => {
    const attachs = await fetchAttachments(lesson.id);
    setLessonAttachments(prev => ({ ...prev, [lesson.id]: attachs }));
    setEditingId(lesson.id);
    setCreating(false);
  };

  return (
    <div className="lessons-page">
      <div className="lessons-container">

        {/* Header */}
        <div className="lessons-topbar">
          <Link to={`/courses/${courseId}`} className="lessons-back">
            <ArrowLeft size={16} />
            Volver al curso
          </Link>
          {isProfessor && !creating && (
            <button className="lessons-add-btn" onClick={() => { setCreating(true); setEditingId(null); }}>
              <Plus size={16} />
              Nueva lección
            </button>
          )}
        </div>

        <h1 className="lessons-heading">Lecciones</h1>

        {(error || loadError) && <Alert>{error || 'No se pudieron cargar las lecciones.'}</Alert>}

        {/* Create form */}
        <AnimatePresence initial={false}>
          {creating && (
            <motion.div
              className="lesson-card lesson-card--form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <p className="lesson-card-form-title">Nueva lección</p>
              <LessonForm
                onSave={handleCreate}
                onCancel={() => setCreating(false)}
                onComplete={handleFormComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* List */}
        {loading ? (
          <Loading />
        ) : lessons.length === 0 && !creating ? (
          <EmptyState
            boxed
            message="No hay lecciones todavía."
            action={isProfessor && (
              <button className="lessons-add-btn" onClick={() => setCreating(true)}>
                <Plus size={16} /> Crear primera lección
              </button>
            )}
          />
        ) : (
          <motion.div
            className="lessons-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {lessons.map((lesson, idx) => {
              const isEditing = editingId === lesson.id;
              const chips = lessonAttachments[lesson.id] || [];

              return (
                <motion.div
                  key={lesson.id}
                  layout
                  transition={{ layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
                  style={{ borderRadius: '10px' }}
                  className={`lesson-card ${isEditing ? 'lesson-card--editing' : ''}`}
                >
                  {isEditing ? (
                    <motion.div layout="position" key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: 0.08 }}>
                      <p className="lesson-card-form-title">Editando lección {idx + 1}</p>
                      <LessonForm
                        initial={{ title: lesson.title, content: lesson.content, attachments: chips }}
                        lessonId={lesson.id}
                        onSave={handleEdit}
                        onCancel={() => setEditingId(null)}
                        onComplete={handleFormComplete}
                      />
                    </motion.div>
                  ) : (
                    <motion.div layout="position" key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: 0.08 }} className="lesson-row">
                      <span className="lesson-num">{idx + 1}</span>
                      <div className="lesson-meta">
                        <span className="lesson-title">{lesson.title}</span>
                        {chips.length > 0 && (
                          <div className="lesson-chips">
                            {chips.map(a => <AttachmentChip key={a.id} a={a} />)}
                          </div>
                        )}
                      </div>
                      {isProfessor && (
                        <div className="lesson-actions">
                          <button
                            className="lesson-icon-btn"
                            title="Editar"
                            onClick={() => startEdit(lesson)}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="lesson-icon-btn lesson-icon-btn--danger"
                            title="Eliminar"
                            onClick={() => handleDelete(lesson.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
