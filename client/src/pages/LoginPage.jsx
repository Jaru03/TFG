export default function LoginPage() {
  return (
    <div className="container">
      <div className="card">
        <h1>Bienvenido a EduTech</h1>
        <p>Accede con tu cuenta de Google para continuar.</p>
        <a className="button" href="/auth/google">
          Iniciar sesión con Google
        </a>
        <p style={{ marginTop: '1rem', opacity: 0.7 }}>
          Asegúrate de haber configurado las credenciales en <code>.env</code>.
        </p>
      </div>
    </div>
  );
}
