import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

export default function LessonsPage({ user }) {
  const { id } = useParams();
  const [lessons, setLessons] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
    try {
      await axios.post(`/api/courses/${id}/lessons`, { title, content });
      setTitle('');
      setContent('');
      load();
    } catch (err) {
      setError('No se pudo crear la lección.');
    }
  };

  return (
    <>
      <Header user={user} />
      <main className="container">
        <section>
          <h1>Lecciones</h1>
          <p>
            <Link className="button" to={`/courses/${id}`}>
              Volver al curso
            </Link>
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          {user.role === 'profesor' || user.role === 'administrador' ? (
            <form className="form" onSubmit={handleCreate}>
              <h2>Crear nueva lección</h2>
              <div className="form-group">
                <label>Título</label>
                <input value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Contenido</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} />
              </div>
              <button className="button" type="submit">
                Guardar lección
              </button>
            </form>
          ) : null}

          {loading ? (
            <div className="loading">Cargando...</div>
          ) : lessons.length === 0 ? (
            <div className="card">No hay lecciones.</div>
          ) : (
            lessons.map(lesson => (
              <div key={lesson.id} className="card">
                <h3>{lesson.title}</h3>
                <p>{lesson.content}</p>
              </div>
            ))
          )}
        </section>
      </main>
    </>
  );
}
