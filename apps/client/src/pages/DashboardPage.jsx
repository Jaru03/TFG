import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';

export default function DashboardPage({ user }) {
  return (
    <>
      <Header />
      <main className="container">
        <section>
          <h1>Panel de usuario</h1>
          <p>Bienvenido a EduTech. A continuación tienes los cursos disponibles.</p>
          <div className="toolbar" style={{ marginBottom: '1rem' }}>
            {(user.role === 'profesor' || user.role === 'administrador') && (
              <Button to="/courses/create">Crear curso</Button>
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
