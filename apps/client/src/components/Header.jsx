import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';

export default function Header() {
  const { user, logout } = useAuth();

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
            <Button variant="secondary" onClick={logout}>
              Cerrar sesión
            </Button>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
