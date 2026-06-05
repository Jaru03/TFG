import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '../../api';
import { Trash2, BookOpen, ChevronRight, Plus, X } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';
import AutoTextarea from '../../components/AutoTextarea';

// ── Create course modal ───────────────────────────────────────────────────────

function CreateCourseModal({ onClose, onCreated }) {
  const [form, setForm]     = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const handleSave = async () => {
    if (!form.title.trim()) return setError('El título es obligatorio.');
    setSaving(true);
    setError(null);
    try {
      await adminApi.createCourse(form);
      onCreated();
      onClose();
    } catch {
      setError('No se pudo crear el curso.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div className="admin-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
      <motion.div className="admin-modal"
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
        <div className="admin-modal-header">
          <span className="admin-modal-title">Nuevo curso</span>
          <button className="admin-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        {error && <Alert>{error}</Alert>}
        <div className="admin-lfield">
          <label>Título</label>
          <input autoFocus value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título del curso" />
        </div>
        <div className="admin-lfield">
          <label>Descripción</label>
          <AutoTextarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción opcional" />
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="admin-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Creando…' : 'Crear curso'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Course row ────────────────────────────────────────────────────────────────

function CourseRow({ course, onOpen, onDelete }) {
  return (
    <tr className="admin-row-clickable" onClick={() => onOpen(course)}>
      <td>
        <div className="admin-user-cell">
          {course.cover_image ? (
            <img src={course.cover_image} alt="" className="admin-course-thumb" />
          ) : (
            <div className="admin-course-thumb-placeholder"><BookOpen size={16} /></div>
          )}
          <span className="admin-name">{course.title}</span>
        </div>
      </td>
      <td className="admin-muted">{course.instructor ?? '—'}</td>
      <td className="admin-muted">
        {course.created_at ? new Date(course.created_at).toLocaleDateString('es-ES') : '—'}
      </td>
      <td>
        <div className="admin-actions">
          <button
            className="admin-btn-icon"
            onClick={e => { e.stopPropagation(); onDelete(course.id); }}
            title="Eliminar curso"
          >
            <Trash2 size={14} />
          </button>
          <ChevronRight size={16} className="admin-row-chevron" />
        </div>
      </td>
    </tr>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

export default function CoursesSection() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: courses = [], isLoading: loading, error: loadError } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: adminApi.courses,
  });

  const invalidateCourses = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.removeCourse(id),
    onSuccess: invalidateCourses,
    onError: () => setError('No se pudo eliminar el curso.'),
  });

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este curso? Se eliminarán también sus lecciones y tests.')) return;
    deleteMutation.mutate(id);
  };

  const filtered = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading minHeight="200px" message="Cargando cursos…" />;

  // ── List view ──
  return (
    <div>
      {showCreate && (
        <CreateCourseModal
          onClose={() => setShowCreate(false)}
          onCreated={invalidateCourses}
        />
      )}

      <div className="admin-section-header">
        <div>
          <h1>Cursos</h1>
          <p>{courses.length} cursos en la plataforma</p>
        </div>
        <button className="admin-add-btn" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> Nuevo curso
        </button>
      </div>

      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
        <StatCard icon={<BookOpen size={18} />} label="Total cursos" value={courses.length} iconBg="#eef2ff" iconColor="#6366f1" />
        <StatCard icon={<BookOpen size={18} />} label="Instructores únicos" value={new Set(courses.map(c => c.instructor).filter(Boolean)).size} iconBg="#fef3c7" iconColor="#d97706" />
      </div>

      {(error || loadError) && <Alert>{error || 'No se pudieron cargar los cursos.'}</Alert>}

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Buscar por título o instructor…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Instructor</th>
              <th>Creado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="admin-empty">Sin resultados</td></tr>
            ) : (
              filtered.map(c => (
                <CourseRow
                  key={c.id}
                  course={c}
                  onOpen={(course) => navigate(`/admin/courses/${course.id}`)}
                  onDelete={handleDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
