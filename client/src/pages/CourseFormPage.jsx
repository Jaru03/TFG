import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

export default function CourseFormPage({ user }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const editId = searchParams.get('edit');

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const res = await axios.get(`/api/courses/${editId}`);
        setTitle(res.data.title);
        setDescription(res.data.description);
      } catch (err) {
        setError('No se pudo cargar el curso.');
      }
    })();
  }, [editId]);

  const handleSubmit = async ev => {
    ev.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }

    try {
      if (editId) {
        await axios.put(`/api/courses/${editId}`, { title, description });
        setSuccess('Curso actualizado correctamente.');
      } else {
        await axios.post('/api/courses', { title, description });
        setSuccess('Curso creado correctamente.');
        setTitle('');
        setDescription('');
      }
      setTimeout(() => navigate('/courses'), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el curso.');
    }
  };

  return (
    <>
      <Header user={user} />
      <main className="container">
        <section>
          <h1>{editId ? 'Editar curso' : 'Crear nuevo curso'}</h1>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Título</label>
              <input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button className="button" type="submit">
                Guardar
              </button>
              <button className="button secondary" type="button" onClick={() => navigate('/courses')}>
                Cancelar
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
