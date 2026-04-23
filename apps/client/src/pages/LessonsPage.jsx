import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Plus, Trash2, Pencil, X,
  ImageIcon, FileVideo, FileText, Link2, Upload, Check,
} from 'lucide-react';
import './LessonsPage.css';

// ── Helpers ────────────────────────────────────────────────────────────────

function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      return `https://player.vimeo.com/video${u.pathname}`;
    }
  } catch { /* invalid url */ }
  return null;
}

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
      await axios.delete(`/api/lessons/attachments/${attachmentId}`);
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
        await axios.post(`/api/lessons/${id}/attachments`, fd);
      }

      if (videoUrl.trim()) {
        await axios.post(`/api/lessons/${id}/attachments`, { videoUrl: videoUrl.trim() });
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
        <textarea
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
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [lessonAttachments, setLessonAttachments] = useState({});

  const isProfessor = user.role === 'profesor' || user.role === 'administrador';

  const load = async () => {
    try {
      const res = await axios.get(`/api/courses/${courseId}/lessons`);
      setLessons(res.data);
    } catch {
      setError('No se pudieron cargar las lecciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [courseId]);

  const fetchAttachments = async (lessonId) => {
    if (lessonAttachments[lessonId]) return lessonAttachments[lessonId];
    try {
      const res = await axios.get(`/api/lessons/${lessonId}/attachments`);
      setLessonAttachments(prev => ({ ...prev, [lessonId]: res.data }));
      return res.data;
    } catch { return []; }
  };

  const handleCreate = async ({ title, content }) => {
    const res = await axios.post(`/api/courses/${courseId}/lessons`, { title, content });
    return res.data;
  };

  const handleEdit = async ({ title, content, lessonId }) => {
    const lesson = lessons.find(l => l.id === lessonId);
    const res = await axios.put(`/api/lessons/${lessonId}`, {
      title,
      content,
      orderNumber: lesson?.order_number || 1,
    });
    return res.data;
  };

  const handleFormComplete = async (lessonId) => {
    setCreating(false);
    setEditingId(null);
    await load();
    try {
      const res = await axios.get(`/api/lessons/${lessonId}/attachments`);
      setLessonAttachments(prev => ({ ...prev, [lessonId]: res.data }));
    } catch { /* tabla aún no creada o sin adjuntos */ }
  };

  const handleDelete = async (lessonId) => {
    if (!confirm('¿Eliminar esta lección?')) return;
    try {
      await axios.delete(`/api/lessons/${lessonId}`);
      await load();
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

        {error && <div className="lessons-alert lessons-alert-error">{error}</div>}

        {/* Create form */}
        {creating && (
          <div className="lesson-card lesson-card--form">
            <p className="lesson-card-form-title">Nueva lección</p>
            <LessonForm
              onSave={handleCreate}
              onCancel={() => setCreating(false)}
              onComplete={handleFormComplete}
            />
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="lessons-loading">Cargando…</div>
        ) : lessons.length === 0 && !creating ? (
          <div className="lessons-empty">
            <p>No hay lecciones todavía.</p>
            {isProfessor && (
              <button className="lessons-add-btn" onClick={() => setCreating(true)}>
                <Plus size={16} /> Crear primera lección
              </button>
            )}
          </div>
        ) : (
          <div className="lessons-list">
            {lessons.map((lesson, idx) => {
              const isEditing = editingId === lesson.id;
              const chips = lessonAttachments[lesson.id] || [];

              return (
                <div key={lesson.id} className={`lesson-card ${isEditing ? 'lesson-card--editing' : ''}`}>
                  {isEditing ? (
                    <>
                      <p className="lesson-card-form-title">Editando lección {idx + 1}</p>
                      <LessonForm
                        initial={{ title: lesson.title, content: lesson.content, attachments: chips }}
                        lessonId={lesson.id}
                        onSave={handleEdit}
                        onCancel={() => setEditingId(null)}
                        onComplete={handleFormComplete}
                      />
                    </>
                  ) : (
                    <div className="lesson-row">
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
