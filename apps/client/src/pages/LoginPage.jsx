import Button from '../components/Button';

export default function LoginPage() {
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '420px', margin: '6rem auto', textAlign: 'center' }}>
        <h1>Bienvenido a EduTech</h1>
        <p style={{ marginBottom: '2rem', opacity: 0.7 }}>
          Elige cómo quieres acceder a la plataforma.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <a className="button" href="/auth/google?role=alumno">
            Entrar como Alumno
          </a>
          <a className="button secondary" href="/auth/google?role=profesor">
            Registrarme como Profesor
          </a>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', opacity: 0.5 }}>
          La autenticación se realiza con tu cuenta de Google.
        </p>
      </div>
    </div>
  );
}
