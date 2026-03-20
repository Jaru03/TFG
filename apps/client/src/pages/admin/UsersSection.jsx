import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Users, BookOpen, UserCheck, ShieldCheck } from 'lucide-react';
import StatCard from './StatCard';

function UserRow({ user, onRoleChange, onDelete }) {
  return (
    <tr>
      <td>
        <div className="admin-user-cell">
          <div className="admin-avatar">{user.name[0].toUpperCase()}</div>
          <span>{user.name}</span>
        </div>
      </td>
      <td className="admin-muted">{user.email}</td>
      <td>
        <select
          className="admin-role-select"
          value={user.role}
          onChange={e => onRoleChange(user.id, e.target.value)}
        >
          <option value="alumno">Alumno</option>
          <option value="profesor">Profesor</option>
          <option value="administrador">Administrador</option>
        </select>
      </td>
      <td>
        <button
          className="admin-btn-delete"
          onClick={() => onDelete(user.id)}
          title="Eliminar usuario"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}

export default function UsersSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

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

  useEffect(() => { fetchUsers(); }, []);

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

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    alumnos: users.filter(u => u.role === 'alumno').length,
    profesores: users.filter(u => u.role === 'profesor').length,
    admins: users.filter(u => u.role === 'administrador').length,
  };

  if (loading) return <div className="admin-loading">Cargando usuarios…</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h1>Usuarios</h1>
          <p>{users.length} usuarios registrados</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <StatCard icon={<Users size={20} />}       label="Total"      value={stats.total}      color="#3b82f6" />
        <StatCard icon={<BookOpen size={20} />}    label="Alumnos"    value={stats.alumnos}    color="#10b981" />
        <StatCard icon={<UserCheck size={20} />}   label="Profesores" value={stats.profesores} color="#f59e0b" />
        <StatCard icon={<ShieldCheck size={20} />} label="Admins"     value={stats.admins}     color="#8b5cf6" />
      </div>

      {error && <div className="admin-alert">{error}</div>}

      <div className="admin-table-header">
        <input
          className="admin-search"
          placeholder="Buscar por nombre o email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="admin-empty">Sin resultados</td></tr>
            ) : (
              filtered.map(u => (
                <UserRow
                  key={u.id}
                  user={u}
                  onRoleChange={handleRoleChange}
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
