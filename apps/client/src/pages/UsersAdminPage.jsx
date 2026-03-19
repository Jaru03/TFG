import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';

export default function UsersAdminPage({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/users/${userId}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      setError('No se pudo actualizar el rol.');
    }
  };

  const handleDelete = async userId => {
    if (!window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    try {
      await axios.delete(`/api/users/${userId}`);
      fetchUsers();
    } catch (err) {
      setError('No se pudo eliminar el usuario.');
    }
  };

  return (
    <>
      <Header user={user} />
      <main className="container">
        <section>
          <h1>Administración de usuarios</h1>
          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading">Cargando usuarios...</div>
          ) : (
            <div>
              {users.length === 0 ? (
                <div className="card">No hay usuarios registrados aún.</div>
              ) : (
                users.map(u => (
                  <div key={u.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{u.name}</strong> <br />
                      <small>{u.email}</small>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="alumno">Alumno</option>
                        <option value="profesor">Profesor</option>
                        <option value="administrador">Administrador</option>
                      </select>
                      <button className="button secondary" onClick={() => handleDelete(u.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
