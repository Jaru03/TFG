import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Play, Trash2 } from 'lucide-react';
import './LessonsPage.css';

export default function LessonsPage({ user }) {
  const { id } = useParams();
  const [lessons, setLessons] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const res = await axios.get(`/api/courses/${id}/lessons`);
      setLessons(res.data);
    } catch (err) {
      setError('No se pudieron cargar las lecciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleCreate = async ev => {
    ev.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }

    try {
      await axios.post(`/api/courses/${id}/lessons`, { title, content });
      setTitle('');
      setContent('');
      setSuccess('Lección creada correctamente.');
      setShowForm(false);
      load();
    } catch (err) {
      setError('No se pudo crear la lección.');
    }
  };

  const handleDelete = async (lessonId) => {
    if (!confirm('¿Estás seguro de eliminar esta lección?')) return;
    try {
      await axios.delete(`/api/lessons/${lessonId}`);
      load();
    } catch (err) {
      setError('No se pudo eliminar la lección.');
    }
  };

  const isProfessor = user.role === 'profesor' || user.role === 'administrador';

  return (
    <div className="lessons-page">
      <div className="lessons-container">
        <div className="lessons-header">
          <Link to={`/courses/${id}`} className="lessons-back">
            <ArrowLeft size={20} />
            <span>Volver al curso</span>
          </Link>
        </div>

        <div className="lessons-title">
          <h1>Lecciones</h1>
          {isProfessor && (
            <button
              className={`lessons-add-btn ${showForm ? 'lessons-add-btn-active' : ''}`}
              onClick={() => setShowForm(!showForm)}
            >
              <Plus size={20} />
              <span>{showForm ? 'Cancelar' : 'Nueva lección'}</span>
            </button>
          )}
        </div>

        {error && <div className="lessons-alert lessons-alert-error">{error}</div>}
        {success && <div className="lessons-alert lessons-alert-success">{success}</div>}

        {showForm && (
          <div className="lessons-form-card">
            <h2>Crear nueva lección</h2>
            <form onSubmit={handleCreate}>
              <div className="lessons-form-group">
                <label>Título</label>
                <input
                  type="text"
                  placeholder="Ej: Introducción al tema"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="lessons-form-group">
                <label>Contenido</label>
                <textarea
                  placeholder="Describe el contenido de la lección..."
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>
              <div className="lessons-form-actions">
                <button type="button" className="lessons-btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="lessons-btn-primary">
                  Crear lección
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="lessons-loading">Cargando...</div>
        ) : lessons.length === 0 ? (
          <div className="lessons-empty">
            <Play size={48} />
            <p>No hay lecciones todavía.</p>
            {isProfessor && <p>Crea tu primera lección para comenzar.</p>}
          </div>
        ) : (
          <div className="lessons-list">
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="lessons-item">
                <span className="lessons-number">{index + 1}</span>
                <div className="lessons-content">
                  <h3>{lesson.title}</h3>
                  <p>{lesson.content}</p>
                </div>
                <Play size={18} className="lessons-play" />
                {isProfessor && (
                  <button className="lessons-delete" onClick={() => handleDelete(lesson.id)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
