import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import Button from '../../components/Button';

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async ev => {
    ev.preventDefault();
    setError(null);
    try {
      await onLogin(username, password);
    } catch {
      setError('Credenciales incorrectas.');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '6rem auto' }}>
        <h1>Backoffice</h1>
        <p style={{ opacity: 0.6, marginBottom: '1.5rem' }}>Acceso restringido a administradores.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Entrar</Button>
        </form>
      </div>
    </div>
  );
}

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch {
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
    } catch {
      setError('No se pudo actualizar el rol.');
    }
  };

  const handleDelete = async userId => {
    if (!window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    try {
      await axios.delete(`/api/users/${userId}`);
      fetchUsers();
    } catch {
      setError('No se pudo eliminar el usuario.');
    }
  };

  if (loading) return <div className="loading">Cargando usuarios...</div>;

  return (
    <section>
      <h1>Administración de usuarios</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {users.length === 0 ? (
        <div className="card">No hay usuarios registrados aún.</div>
      ) : (
        users.map(u => (
          <div key={u.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{u.name}</strong><br />
              <small>{u.email}</small>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}>
                <option value="alumno">Alumno</option>
                <option value="profesor">Profesor</option>
                <option value="administrador">Administrador</option>
              </select>
              <Button variant="secondary" onClick={() => handleDelete(u.id)}>Eliminar</Button>
            </div>
          </div>
        ))
      )}
    </section>
  );
}

export default function AdminPage() {
  const { admin, checking, login, logout } = useAdminAuth();

  if (checking) return <div className="loading">Cargando...</div>;

  if (!admin) return <AdminLogin onLogin={login} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 2rem', borderBottom: '1px solid #e5e7eb' }}>
        <span style={{ marginRight: '1rem', opacity: 0.7 }}>Backoffice — {admin.username}</span>
        <Button variant="secondary" onClick={logout}>Cerrar sesión</Button>
      </div>
      <main className="container">
        <UsersList />
      </main>
    </div>
  );
}
