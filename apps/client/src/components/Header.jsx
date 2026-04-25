import { Link } from 'react-router-dom';
import { Home, BookOpen, Library, BarChart2, Users, GraduationCap, UserCircle } from 'lucide-react';
import './Header.css';

export default function Header({ user }) {
  const isStudent = user && user.role === 'alumno';

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-brand">
          <GraduationCap size={28} className="header-logo" />
          <span>EduTech</span>
        </Link>

        {user ? (
          <nav className="header-nav">
            <Link to="/" className="header-link">
              <Home size={18} />
              <span>Inicio</span>
            </Link>
            <Link to="/courses" className="header-link">
              <BookOpen size={18} />
              <span>Cursos</span>
            </Link>
            {isStudent && (
              <>
                <Link to="/my-courses" className="header-link">
                  <Library size={18} />
                  <span>Mis cursos</span>
                </Link>
                <Link to="/progress" className="header-link">
                  <BarChart2 size={18} />
                  <span>Progreso</span>
                </Link>
              </>
            )}
            {user.role === 'administrador' && (
              <Link to="/users" className="header-link">
                <Users size={18} />
                <span>Usuarios</span>
              </Link>
            )}
            <Link to="/account" className="header-link">
              <UserCircle size={18} />
              <span>Mi cuenta</span>
            </Link>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
