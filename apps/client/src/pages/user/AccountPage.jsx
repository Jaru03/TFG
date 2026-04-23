import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar, LogOut, Library, BarChart2, ChevronRight, Mail,
  BookOpen, Users, ClipboardCheck, Plus,
} from 'lucide-react';
import './AccountPage.css';

const ROLE_LABELS = {
  alumno:        { label: 'Alumno',        cls: 'role--alumno' },
  profesor:      { label: 'Profesor',      cls: 'role--profesor' },
  administrador: { label: 'Administrador', cls: 'role--admin' },
};

const AVATAR_PALETTES = [
  { bg: '#dbeafe', color: '#1d4ed8' },
  { bg: '#dcfce7', color: '#15803d' },
  { bg: '#ede9fe', color: '#6d28d9' },
  { bg: '#fce7f3', color: '#be185d' },
  { bg: '#fed7aa', color: '#c2410c' },
  { bg: '#cffafe', color: '#0e7490' },
];

function avatarPalette(name) {
  const idx = name ? name.charCodeAt(0) % AVATAR_PALETTES.length : 0;
  return AVATAR_PALETTES[idx];
}

function InfoRow({ label, children }) {
  return (
    <div className="acc-info-row">
      <span className="acc-info-label">{label}</span>
      <span className="acc-info-value">{children}</span>
    </div>
  );
}

function StatRow({ icon: Icon, value, label }) {
  return (
    <div className="acc-stat-row">
      <Icon size={16} className="acc-stat-row-icon" />
      <span className="acc-stat-row-label">{label}</span>
      <span className="acc-stat-row-value">{value ?? '—'}</span>
    </div>
  );
}

const GoogleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" className="acc-info-icon">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ── Student section ────────────────────────────────────────────────────────
function StudentContent() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('/api/courses/enrolled'),
      axios.get('/api/results/me'),
    ]).then(([cRes, rRes]) => {
      setStats({ courses: cRes.data.length, tests: rRes.data.length });
    }).catch(() => setStats({ courses: 0, tests: 0 }));
  }, []);

  return (
    <>
      <div className="acc-card">
        <h2 className="acc-card-title">Mi actividad</h2>
        <StatRow icon={Library}       value={stats?.courses} label="Cursos inscritos" />
        <StatRow icon={ClipboardCheck} value={stats?.tests}   label="Tests completados" />
      </div>

      <div className="acc-card acc-links">
        <Link to="/my-courses" className="acc-link-row">
          <Library size={16} className="acc-link-icon" />
          <span>Mis cursos</span>
          <ChevronRight size={15} className="acc-link-chevron" />
        </Link>
        <Link to="/progress" className="acc-link-row">
          <BarChart2 size={16} className="acc-link-icon" />
          <span>Mi progreso</span>
          <ChevronRight size={15} className="acc-link-chevron" />
        </Link>
      </div>
    </>
  );
}

// ── Teacher section ────────────────────────────────────────────────────────
function TeacherContent() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/courses/stats')
      .then(r => setStats(r.data))
      .catch(() => setStats({ courses: 0, students: 0, testsCompleted: 0 }));
  }, []);

  return (
    <>
      <div className="acc-card">
        <h2 className="acc-card-title">Mi actividad docente</h2>
        <StatRow icon={BookOpen}       value={stats?.courses}        label="Cursos creados" />
        <StatRow icon={Users}          value={stats?.students}       label="Alumnos inscritos" />
        <StatRow icon={ClipboardCheck} value={stats?.testsCompleted} label="Tests realizados por alumnos" />
      </div>

      <div className="acc-card acc-links">
        <Link to="/courses" className="acc-link-row">
          <BookOpen size={16} className="acc-link-icon" />
          <span>Mis cursos</span>
          <ChevronRight size={15} className="acc-link-chevron" />
        </Link>
        <Link to="/courses/create" className="acc-link-row">
          <Plus size={16} className="acc-link-icon" />
          <span>Crear nuevo curso</span>
          <ChevronRight size={15} className="acc-link-chevron" />
        </Link>
      </div>
    </>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AccountPage({ user, logout }) {
  const palette  = avatarPalette(user.name);
  const initials = user.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';
  const roleInfo = ROLE_LABELS[user.role] || { label: user.role, cls: '' };
  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const isTeacher = user.role === 'profesor' || user.role === 'administrador';

  return (
    <main className="acc-shell">
      <div className="acc-container">

        {/* ── Hero ── */}
        <div className="acc-hero">
          <div className="acc-hero-body">
            <div className="acc-avatar" style={{ background: palette.bg, color: palette.color }}>
              {initials}
            </div>
            <div className="acc-hero-text">
              <h1 className="acc-name">{user.name}</h1>
              <span className={`acc-role-badge ${roleInfo.cls}`}>{roleInfo.label}</span>
            </div>
            {joinDate && (
              <p className="acc-since">
                <Calendar size={13} />
                Miembro desde {joinDate}
              </p>
            )}
          </div>
        </div>

        {/* ── Info personal ── */}
        <div className="acc-card">
          <h2 className="acc-card-title">Información personal</h2>
          <InfoRow label="Nombre completo">{user.name}</InfoRow>
          {user.email && (
            <InfoRow label="Correo electrónico">
              <Mail size={13} className="acc-info-icon" />
              {user.email}
            </InfoRow>
          )}
          <InfoRow label="Tipo de cuenta">
            <GoogleIcon />
            Google
          </InfoRow>
        </div>

        {/* ── Contenido por rol ── */}
        {isTeacher ? <TeacherContent /> : <StudentContent />}

        {/* ── Sesión ── */}
        <div className="acc-session">
          <button className="acc-logout-btn" onClick={logout}>
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>

      </div>
    </main>
  );
}
