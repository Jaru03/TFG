import { useState } from 'react';
import { GraduationCap } from 'lucide-react';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ev => {
    ev.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(username, password);
    } catch {
      setError('Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <GraduationCap size={32} />
          <span>EduTech</span>
        </div>
        <h2>Backoffice</h2>
        <p>Acceso restringido a administradores</p>

        {error && <div className="admin-alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label>Usuario</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              required
              autoFocus
            />
          </div>
          <div className="admin-field">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button className="admin-btn-primary" type="submit" disabled={loading}>
            {loading ? 'Verificando…' : 'Acceder'}
          </button>
        </form>
      </div>
    </div>
  );
}
