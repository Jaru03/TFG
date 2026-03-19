import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Button from '../components/Button';

export default function TestsPage({ user }) {
  const { id } = useParams();
  const [tests, setTests] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
    try {
      await axios.post(`/api/courses/${id}/tests`, { title, description });
      setTitle('');
      setDescription('');
      load();
    } catch (err) {
      setError('No se pudo crear el test.');
    }
  };

  return (
    <>
      <Header />
      <main className="container">
        <section>
          <h1>Tests</h1>
          <p>
            <Button to={`/courses/${id}`}>Volver al curso</Button>
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          {user.role === 'profesor' || user.role === 'administrador' ? (
            <form className="form" onSubmit={handleCreate}>
              <h2>Crear nuevo test</h2>
              <div className="form-group">
                <label>Título</label>
                <input value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
              </div>
              <Button type="submit">Guardar test</Button>
            </form>
          ) : null}

          {loading ? (
            <div className="loading">Cargando...</div>
          ) : tests.length === 0 ? (
            <div className="card">No hay tests.</div>
          ) : (
            tests.map(test => (
              <div key={test.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{test.title}</h3>
                  <p>{test.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button to={`/tests/${test.id}`}>Realizar</Button>
                  {(user.role === 'profesor' || user.role === 'administrador') && (
                    <Button variant="secondary" to={`/tests/${test.id}/manage`}>Gestionar</Button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </>
  );
}
