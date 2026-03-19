import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function DashboardPage({ user }) {
  return (
    <>
      <Header user={user} />
      <main className="container">
        <section>
          <h1>Panel de usuario</h1>
          <p>Bienvenido a EduTech. A continuación tienes los cursos disponibles.</p>
          <div className="toolbar" style={{ marginBottom: '1rem' }}>
            {(user.role === 'profesor' || user.role === 'administrador') && (
              <Link className="button" to="/courses/create">
                Crear curso
              </Link>
            )}
          </div>
          <p>
            Ve a <Link to="/courses">Cursos</Link> para explorar el contenido.
          </p>
        </section>
      </main>
    </>
  );
}
