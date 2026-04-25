import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, ChevronRight, BookOpen, Users, ClipboardCheck } from 'lucide-react';
import './TeacherDashboard.css';

function greeting(name) {
  const h = new Date().getHours();
  const saludo = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  return `${saludo}, ${name.split(' ')[0]}`;
}

function todayLabel() {
  return new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function TeacherDashboard({ user }) {
  const [courses, setCourses] = useState([]);
  const [stats, setStats]     = useState({ courses: 0, students: 0, testsCompleted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/courses'),
      axios.get('/api/courses/stats'),
    ]).then(([coursesRes, statsRes]) => {
      setCourses(coursesRes.data.filter(c => c.created_by === user.id));
      setStats(statsRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div className="td-shell">

      {/* ── Greeting ── */}
      <div className="td-greeting">
        <div>
          <h1 className="td-greeting-title">{greeting(user.name)}</h1>
          <p className="td-greeting-date">{todayLabel()}</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="td-stats">
        <div className="td-stat">
          <div className="td-stat-icon">
            <BookOpen size={18} />
          </div>
          <div>
            <span className="td-stat-value">{stats.courses}</span>
            <span className="td-stat-label">Cursos</span>
          </div>
        </div>
        <div className="td-stat">
          <div className="td-stat-icon">
            <Users size={18} />
          </div>
          <div>
            <span className="td-stat-value">{stats.students}</span>
            <span className="td-stat-label">Alumnos</span>
          </div>
        </div>
        <div className="td-stat">
          <div className="td-stat-icon">
            <ClipboardCheck size={18} />
          </div>
          <div>
            <span className="td-stat-value">{stats.testsCompleted}</span>
            <span className="td-stat-label">Tests completados</span>
          </div>
        </div>
      </div>

      {/* ── Courses ── */}
      {loading ? (
        <div className="td-loading">Cargando…</div>
      ) : courses.length === 0 ? (
        <div className="td-empty">
          <p>No has creado ningún curso todavía.</p>
          <Link to="/courses/create" className="td-create-link">Crear tu primer curso</Link>
        </div>
      ) : (
        <div className="td-courses">
          <div className="td-courses-header">
            <h2>Mis cursos</h2>
            <Link to="/courses" className="td-see-all">Ver todos <ChevronRight size={14} /></Link>
          </div>
          <div className="td-courses-list">
            {courses.slice(0, 5).map(course => (
              <Link key={course.id} to={`/courses/${course.id}`} className="td-course-item">
                <div className={`td-course-thumb ${!course.cover_image ? 'td-course-thumb--placeholder' : ''}`}>
                  {course.cover_image
                    ? <img src={course.cover_image} alt={course.title} />
                    : <span>{course.title.charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div className="td-course-info">
                  <p className="td-course-title">{course.title}</p>
                  <p className="td-course-desc">{course.description || 'Sin descripción'}</p>
                </div>
                <ChevronRight size={16} className="td-course-chevron" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── FAB ── */}
      <Link to="/courses/create" className="teacher-fab" title="Crear nuevo curso">
        <span className="teacher-fab-text">Crear nuevo curso</span>
        <span className="teacher-fab-icon"><Plus size={20} /></span>
      </Link>
    </div>
  );
}
