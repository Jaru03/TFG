import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, FileText, Trash2 } from 'lucide-react';
import './TestsPage.css';

export default function TestsPage({ user }) {
  const { id } = useParams();
  const [tests, setTests] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const res = await axios.get(`/api/courses/${id}/tests`);
      setTests(res.data);
    } catch (err) {
      setError('No se pudieron cargar los tests.');
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
      await axios.post(`/api/courses/${id}/tests`, { title, description });
      setTitle('');
      setDescription('');
      setSuccess('Test creado correctamente.');
      setShowForm(false);
      load();
    } catch (err) {
      setError('No se pudo crear el test.');
    }
  };

  const handleDelete = async (testId) => {
    if (!confirm('¿Estás seguro de eliminar este test?')) return;
    try {
      await axios.delete(`/api/tests/${testId}`);
      load();
    } catch (err) {
      setError('No se pudo eliminar el test.');
    }
  };

  const isProfessor = user.role === 'profesor' || user.role === 'administrador';

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

        {error && <div className="tests-alert tests-alert-error">{error}</div>}
        {success && <div className="tests-alert tests-alert-success">{success}</div>}

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
                <textarea
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
                <button type="submit" className="tests-btn-primary">
                  Crear test
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="tests-loading">Cargando...</div>
        ) : tests.length === 0 ? (
          <div className="tests-empty">
            <FileText size={48} />
            <p>No hay tests todavía.</p>
            {isProfessor && <p>Crea tu primer test para evaluar a tus alumnos.</p>}
          </div>
        ) : (
          <div className="tests-list">
            {tests.map(test => (
              <div key={test.id} className="tests-item">
                <div className="tests-icon">
                  <FileText size={24} />
                </div>
                <div className="tests-content">
                  <h3>{test.title}</h3>
                  <p>{test.description || 'Sin descripción'}</p>
                </div>
                <div className="tests-actions">
                  {isProfessor ? (
                    <>
                      <Link to={`/tests/${test.id}/manage`} className="tests-btn tests-btn-primary">
                        Gestionar
                      </Link>
                      <button className="tests-btn tests-btn-delete" onClick={() => handleDelete(test.id)}>
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <Link to={`/tests/${test.id}`} className="tests-btn tests-btn-primary">
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
