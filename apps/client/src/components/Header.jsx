import { Link } from 'react-router-dom';
import { BookOpen, Users, LogOut, GraduationCap } from 'lucide-react';
import './Header.css';

export default function Header({ user, logout }) {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-brand">
          <GraduationCap size={28} className="header-logo" />
          <span>EduTech</span>
        </Link>

        {user ? (
          <nav className="header-nav">
            <Link to="/courses" className="header-link">
              <BookOpen size={18} />
              <span>Cursos</span>
            </Link>
            {user.role === 'administrador' && (
              <Link to="/users" className="header-link">
                <Users size={18} />
                <span>Usuarios</span>
              </Link>
            )}
            <span className="header-user">{user.name}</span>
            <button onClick={logout} className="header-logout">
              <LogOut size={18} />
            </button>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
