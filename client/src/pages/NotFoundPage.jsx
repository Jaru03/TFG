import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container">
      <div className="card">
        <h1>404 - Página no encontrada</h1>
        <p>La página que buscas no existe.</p>
        <Link className="button" to="/">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
