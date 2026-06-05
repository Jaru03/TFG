import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Plus, Pencil, Check, ChevronRight,
  BookOpen, ClipboardList, Users,
} from 'lucide-react';
import { adminApi } from '../../../api';
import Alert from '../../../components/Alert';
import StudentsProgressTable from '../../../components/StudentsProgressTable';
import AutoTextarea from '../../../components/AutoTextarea';
import EditorModal from './EditorModal';
import LessonsPanel from './LessonsPanel';
import TestsPanel from './TestsPanel';

export default function CourseEditor({ course, onBack, onSaved }) {
  const queryClient = useQueryClient();
  const [form, setForm]     = useState({ title: course.title, description: course.description || '' });
  const [error, setError]   = useState(null);
  const [saved, setSaved]   = useState(false);
  const [lessonCount, setLessonCount] = useState('—');
  const [testCount, setTestCount]     = useState('—');
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [creatingTest, setCreatingTest]     = useState(false);
  const [openSection, setOpenSection] = useState(null); // 'data' | 'lessons' | 'tests' | 'students'

  // Las stats son informativas: si fallan, no bloqueamos el editor.
  const { data: stats } = useQuery({
    queryKey: ['admin', 'courses', course.id, 'stats'],
    queryFn: () => adminApi.courseStats(course.id),
  });

  const saveMutation = useMutation({
    mutationFn: () => adminApi.updateCourse(course.id, form),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      onSaved?.();
    },
    onError: () => setError('No se pudo guardar el curso.'),
  });

  const handleSave = () => {
    if (!form.title.trim()) { setError('El título es obligatorio.'); return; }
    setError(null);
    saveMutation.mutate();
  };

  const saving = saveMutation.isPending;

  return (
    <div>
      <button className="editor-back" onClick={onBack}>
        <ArrowLeft size={14} /> Cursos
      </button>

      {/* Hero banner */}
      <div className="editor-hero">
        <div className="editor-hero-top">
          <div>
            <div className="editor-hero-title">{form.title || 'Sin título'}</div>
            {form.description && (
              <div className="editor-hero-desc">{form.description}</div>
            )}
            <div className="editor-hero-pills">
              <span className="editor-hero-pill">
                <Users size={11} /> Instructor: {course.instructor || 'Sin asignar'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      {/* Tarjetas de gestión: cada una abre un diálogo */}
      <div className="editor-cards-grid">
        <button className="editor-card" onClick={() => setOpenSection('data')}>
          <div className="editor-section-icon data"><Pencil size={18} /></div>
          <div className="editor-card-info">
            <span className="editor-card-title">Datos del curso</span>
            <span className="editor-card-sub">Título y descripción</span>
          </div>
          <ChevronRight size={18} className="editor-card-arrow" />
        </button>

        <button className="editor-card" onClick={() => setOpenSection('lessons')}>
          <div className="editor-section-icon lessons"><BookOpen size={18} /></div>
          <div className="editor-card-info">
            <span className="editor-card-title">Lecciones</span>
            <span className="editor-card-sub">{(lessonCount === '—' ? (stats?.lessons ?? 0) : lessonCount)} en el curso</span>
          </div>
          <ChevronRight size={18} className="editor-card-arrow" />
        </button>

        <button className="editor-card" onClick={() => setOpenSection('tests')}>
          <div className="editor-section-icon tests"><ClipboardList size={18} /></div>
          <div className="editor-card-info">
            <span className="editor-card-title">Tests</span>
            <span className="editor-card-sub">{(testCount === '—' ? (stats?.tests ?? 0) : testCount)} en el curso</span>
          </div>
          <ChevronRight size={18} className="editor-card-arrow" />
        </button>

        <button className="editor-card" onClick={() => setOpenSection('students')}>
          <div className="editor-section-icon students"><Users size={18} /></div>
          <div className="editor-card-info">
            <span className="editor-card-title">Seguimiento de alumnos</span>
            <span className="editor-card-sub">{stats?.students ?? 0} inscritos · {stats?.avgProgress ?? 0}% medio</span>
          </div>
          <ChevronRight size={18} className="editor-card-arrow" />
        </button>
      </div>

      {/* ── Diálogos ── */}
      {openSection === 'data' && (
        <EditorModal title="Datos del curso" onClose={() => setOpenSection(null)}>
          <div className="admin-lfield">
            <label>Título</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Título del curso" />
          </div>
          <div className="admin-lfield">
            <label>Descripción</label>
            <AutoTextarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción del curso" />
          </div>
          <div className="admin-modal-footer">
            <button className="admin-btn-secondary" onClick={() => setOpenSection(null)}>Cerrar</button>
            <button className="admin-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : (saved ? <><Check size={14} /> Guardado</> : 'Guardar cambios')}
            </button>
          </div>
        </EditorModal>
      )}

      {openSection === 'lessons' && (
        <EditorModal
          title="Lecciones"
          wide
          onClose={() => setOpenSection(null)}
          headerAction={
            <button className="admin-add-btn" onClick={() => setCreatingLesson(true)}>
              <Plus size={13} /> Añadir
            </button>
          }
        >
          <LessonsPanel
            courseId={course.id}
            creating={creatingLesson}
            onCreatingChange={setCreatingLesson}
            onCountChange={setLessonCount}
          />
        </EditorModal>
      )}

      {openSection === 'tests' && (
        <EditorModal
          title="Tests"
          wide
          onClose={() => setOpenSection(null)}
          headerAction={
            <button className="admin-add-btn" onClick={() => setCreatingTest(true)}>
              <Plus size={13} /> Añadir
            </button>
          }
        >
          <TestsPanel
            courseId={course.id}
            creating={creatingTest}
            onCreatingChange={setCreatingTest}
            onCountChange={setTestCount}
          />
        </EditorModal>
      )}

      {openSection === 'students' && (
        <EditorModal title="Seguimiento de alumnos" wide onClose={() => setOpenSection(null)}>
          <StudentsProgressTable endpoint={`/api/admin/courses/${course.id}/students-progress`} />
        </EditorModal>
      )}
    </div>
  );
}
