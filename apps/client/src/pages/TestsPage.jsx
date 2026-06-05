import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testsApi } from '../api';
import { ArrowLeft, Plus, FileText, Trash2, Pencil } from 'lucide-react';
import { isTeacher } from '../lib/roles';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import AutoTextarea from '../components/AutoTextarea';
import './TestsPage.css';

export default function TestsPage({ user }) {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const testsKey = ['courses', id, 'tests'];

  const { data: tests = [], isLoading: loading, error: loadError } = useQuery({
    queryKey: testsKey,
    queryFn: () => testsApi.listByCourse(id),
  });

  const createMutation = useMutation({
    mutationFn: () => testsApi.create(id, { title, description }),
    onSuccess: () => {
      setTitle('');
      setDescription('');
      setSuccess('Test creado correctamente.');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: testsKey });
    },
    onError: () => setError('No se pudo crear el test.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (testId) => testsApi.remove(testId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: testsKey }),
    onError: () => setError('No se pudo eliminar el test.'),
  });

  const handleCreate = (ev) => {
    ev.preventDefault();
    setError(null);
    setSuccess(null);
    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    createMutation.mutate();
  };

  const handleDelete = (testId) => {
    if (!confirm('¿Estás seguro de eliminar este test?')) return;
    deleteMutation.mutate(testId);
  };

  const isProfessor = isTeacher(user);

  return (
    <div className="tests-page">
      <div className="tests-container">
        <div className="tests-header">
          <Link to={`/courses/${id}`} className="tests-back">
            <ArrowLeft size={20} />
            <span>Volver al curso</span>
          </Link>
        </div>

        <div className="tests-title">
          <h1>Tests</h1>
          {isProfessor && (
            <button
              className={`tests-add-btn ${showForm ? 'tests-add-btn-active' : ''}`}
              onClick={() => setShowForm(!showForm)}
            >
              <Plus size={20} />
              <span>{showForm ? 'Cancelar' : 'Nuevo test'}</span>
            </button>
          )}
        </div>

        {(error || loadError) && <Alert>{error || 'No se pudieron cargar los tests.'}</Alert>}
        {success && <Alert type="success">{success}</Alert>}

        {showForm && (
          <div className="tests-form-card">
            <h2>Crear nuevo test</h2>
            <form onSubmit={handleCreate}>
              <div className="tests-form-group">
                <label>Título</label>
                <input
                  type="text"
                  placeholder="Ej: Examen final"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="tests-form-group">
                <label>Descripción</label>
                <AutoTextarea
                  placeholder="Describe el contenido del test..."
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div className="tests-form-actions">
                <button type="button" className="tests-btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="tests-btn-primary" disabled={createMutation.isPending}>
                  Crear test
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <Loading message="Cargando..." />
        ) : tests.length === 0 ? (
          <EmptyState
            boxed
            icon={<FileText size={48} />}
            message="No hay tests todavía."
            hint={isProfessor ? 'Crea tu primer test para evaluar a tus alumnos.' : undefined}
          />
        ) : (
          <div className="tests-list">
            {tests.map((test, idx) => (
              <div key={test.id} className="tests-item">
                <span className="tests-num">{idx + 1}</span>
                <div className="tests-content">
                  <h3>{test.title}</h3>
                  {test.description && <p>{test.description}</p>}
                </div>
                <div className="tests-actions">
                  {isProfessor ? (
                    <>
                      <Link to={`/tests/${test.id}/manage`} className="tests-icon-btn" title="Gestionar preguntas">
                        <Pencil size={15} />
                      </Link>
                      <button className="tests-icon-btn tests-icon-btn--danger" title="Eliminar" onClick={() => handleDelete(test.id)}>
                        <Trash2 size={15} />
                      </button>
                    </>
                  ) : (
                    <Link to={`/tests/${test.id}`} className="tests-realizar-btn">
                      Realizar
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
