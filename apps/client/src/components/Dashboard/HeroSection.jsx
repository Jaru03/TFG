import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronRight, GraduationCap, Zap, Users,
  MonitorPlay, BarChart2, Clock,
} from 'lucide-react';
import CursoCard from '../CursoCard';
import './HeroSection.css';

const FEATURES = [
  {
    icon:  MonitorPlay,
    title: 'Aprende a tu ritmo',
    desc:  'Accede a lecciones con vídeos, imágenes y materiales descargables cuando quieras.',
  },
  {
    icon:  BarChart2,
    title: 'Tests interactivos',
    desc:  'Pon a prueba tus conocimientos con preguntas al final de cada curso y revisa tus errores.',
  },
  {
    icon:  Clock,
    title: 'Sigue tu avance',
    desc:  'Consulta tu historial de resultados y observa cómo mejoras con cada intento.',
  },
];

export default function HeroSection({ user }) {
  const [enrolled, setEnrolled] = useState([]);
  const [allCourses, setAll]    = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/courses/enrolled'),
      axios.get('/api/courses'),
    ]).then(([enrRes, allRes]) => {
      setEnrolled(enrRes.data);
      setAll(allRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const explore = allCourses.filter(c => !enrolled.find(e => e.id === c.id)).slice(0, 4);

  return (
    <div className="hs-shell">

      {/* ── Hero banner ── */}
      <section className="hs-hero">
        <div className="hs-hero-inner">
          <div className="hs-hero-content">
            <span className="hs-hero-eyebrow">
              <Zap size={12} /> Plataforma de aprendizaje
            </span>
            <h1 className="hs-hero-title">
              Despierta tu potencial,<br />
              <span className="hs-hero-title-accent">aprende sin límites.</span>
            </h1>
            <p className="hs-hero-subtitle">
              Accede a cursos de alta calidad impartidos por profesores expertos.
              Realiza tests interactivos, sigue tu progreso y lleva tu formación al siguiente nivel.
            </p>
            <div className="hs-hero-actions">
              <Link to="/courses" className="hs-hero-btn-primary">
                Explorar cursos
              </Link>
              <Link to="/my-courses" className="hs-hero-btn-ghost">
                Mis cursos <ChevronRight size={15} />
              </Link>
            </div>
          </div>

          <div className="hs-hero-badges">
            <div className="hs-hero-badge">
              <GraduationCap size={20} className="hs-hero-badge-icon" />
              <div>
                <strong>{allCourses.length || '+'}</strong>
                <span>Cursos disponibles</span>
              </div>
            </div>
            <div className="hs-hero-badge">
              <Users size={20} className="hs-hero-badge-icon" />
              <div>
                <strong>100%</strong>
                <span>Aprendizaje online</span>
              </div>
            </div>
            <div className="hs-hero-badge">
              <BarChart2 size={20} className="hs-hero-badge-icon" />
              <div>
                <strong>Tests</strong>
                <span>Interactivos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="hs-body">

        {/* ── Features ── */}
        <div className="hs-features">
          {FEATURES.map(f => (
            <div key={f.title} className="hs-feature">
              <div className="hs-feature-icon">
                <f.icon size={22} />
              </div>
              <div>
                <h3 className="hs-feature-title">{f.title}</h3>
                <p className="hs-feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {loading && <div className="hs-loading">Cargando…</div>}

        {/* ── Mis cursos ── */}
        {!loading && enrolled.length > 0 && (
          <section className="hs-section">
            <div className="hs-section-header">
              <div>
                <h2 className="hs-section-title">Mis cursos</h2>
                <p className="hs-section-sub">Continúa donde lo dejaste</p>
              </div>
              <Link to="/my-courses" className="hs-see-all">
                Ver todos <ChevronRight size={14} />
              </Link>
            </div>
            <div className="hs-courses-grid">
              {enrolled.slice(0, 4).map(course => (
                <CursoCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}

        {/* ── Explorar ── */}
        {!loading && explore.length > 0 && (
          <section className="hs-section">
            <div className="hs-section-header">
              <div>
                <h2 className="hs-section-title">
                  {enrolled.length > 0 ? 'Descubre más cursos' : 'Cursos disponibles'}
                </h2>
                <p className="hs-section-sub">Amplía tus conocimientos</p>
              </div>
              <Link to="/courses" className="hs-see-all">
                Ver todos <ChevronRight size={14} />
              </Link>
            </div>
            <div className="hs-courses-grid">
              {explore.map(course => (
                <CursoCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
