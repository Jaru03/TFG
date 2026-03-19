import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Header({ user }) {
  const navigate = useNavigate();

  const logout = async () => {
    await axios.get('/auth/logout');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="container">
        <Link className="brand" to="/">
          EduTech
        </Link>

        {user ? (
          <nav className="nav">
            <span className="nav-text">
              {user.name} ({user.role})
            </span>
            <Link className="nav-link" to="/courses">
              Cursos
            </Link>
            {user.role === 'administrador' && (
              <Link className="nav-link" to="/users">
                Usuarios
              </Link>
            )}
            <button className="button secondary" onClick={logout}>
              Cerrar sesión
            </button>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
