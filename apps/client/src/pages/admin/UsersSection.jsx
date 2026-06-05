import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api';
import { Trash2, Users, BookOpen, UserCheck, ShieldCheck, Pencil, X } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

function RoleBadge({ role }) {
  const map = {
    alumno:        { cls: 'admin-badge-blue',   label: 'Alumno' },
    profesor:      { cls: 'admin-badge-amber',  label: 'Profesor' },
    administrador: { cls: 'admin-badge-purple', label: 'Admin' },
  };
  const { cls, label } = map[role] ?? { cls: 'admin-badge-blue', label: role };
  return <span className={`admin-badge ${cls}`}>{label}</span>;
}

function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!form.name.trim()) return setError('El nombre es obligatorio.');
    setSaving(true);
    setError(null);
    try {
      await adminApi.updateUser(user.id, form);
      onSaved();
      onClose();
    } catch {
      setError('No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal">
        <div className="admin-modal-header">
          <span className="admin-modal-title">Editar usuario</span>
          <button className="admin-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {error && <Alert>{error}</Alert>}

        <div className="admin-lfield">
          <label>Nombre</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nombre completo"
          />
        </div>
        <div className="admin-lfield">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="email@ejemplo.com"
          />
        </div>
        <div className="admin-lfield">
          <label>Rol</label>
          <select
            value={form.role ?? user.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
          >
            <option value="alumno">Alumno</option>
            <option value="profesor">Profesor</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        <div className="admin-modal-footer">
          <button className="admin-btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="admin-btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <div className="admin-user-cell">
          <div className="admin-avatar">{user.name?.[0]?.toUpperCase()}</div>
          <span className="admin-name">{user.name}</span>
        </div>
      </td>
      <td className="admin-muted">{user.email}</td>
      <td>
        <RoleBadge role={user.role} />
      </td>
      <td>
        <div className="admin-actions">
          <button className="admin-btn-icon edit" onClick={() => onEdit(user)} title="Editar usuario">
            <Pencil size={14} />
          </button>
          <button className="admin-btn-icon" onClick={() => onDelete(user.id)} title="Eliminar usuario">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function UsersSection() {
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  const { data: users = [], isLoading: loading, error: loadError } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.users,
  });

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

  const deleteMutation = useMutation({
    mutationFn: (userId) => adminApi.removeUser(userId),
    onSuccess: invalidateUsers,
    onError: () => setError('No se pudo eliminar el usuario.'),
  });

  const handleDelete = (userId) => {
    if (!window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    deleteMutation.mutate(userId);
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:      users.length,
    alumnos:    users.filter(u => u.role === 'alumno').length,
    profesores: users.filter(u => u.role === 'profesor').length,
    admins:     users.filter(u => u.role === 'administrador').length,
  };

  if (loading) return <Loading minHeight="200px" message="Cargando usuarios…" />;

  return (
    <div>
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={invalidateUsers}
        />
      )}

      <div className="admin-section-header">
        <div>
          <h1>Usuarios</h1>
          <p>{users.length} usuarios registrados</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <StatCard icon={<Users size={18} />}       label="Total"      value={stats.total}      iconBg="#eef2ff" iconColor="#6366f1" />
        <StatCard icon={<BookOpen size={18} />}    label="Alumnos"    value={stats.alumnos}    iconBg="#dcfce7" iconColor="#16a34a" />
        <StatCard icon={<UserCheck size={18} />}   label="Profesores" value={stats.profesores} iconBg="#fef3c7" iconColor="#d97706" />
        <StatCard icon={<ShieldCheck size={18} />} label="Admins"     value={stats.admins}     iconBg="#ede9fe" iconColor="#7c3aed" />
      </div>

      {(error || loadError) && <Alert>{error || 'No se pudieron cargar los usuarios.'}</Alert>}

      <div className="admin-toolbar">
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
                  onEdit={setEditingUser}
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
