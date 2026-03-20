import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, ChevronRight } from 'lucide-react';
import StatCard from './StatCard';
import './TeacherDashboard.css';

const TeacherDashboard = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ courses: 0, students: 0, testsCompleted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [coursesRes] = await Promise.all([
          axios.get('/api/courses')
        ]);
        const userCourses = coursesRes.data.filter(c => c.created_by === user.id);
        setCourses(userCourses);
      } catch (err) {
        console.error('Error loading courses', err);
      }
    })();

    axios.get('/api/courses/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error loading stats', err))
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div className="teacher-dashboard">
      <div className="teacher-welcome">
        <h1>Bienvenido, {user.name}</h1>
        <p>Gestiona tus cursos y contenido educativo</p>
      </div>

      <div className="teacher-actions">
        <Link to="/courses/create" className="teacher-action-card teacher-action-primary">
          <Plus size={32} />
          <div>
            <h3>Crear nuevo curso</h3>
            <p>Añade un nuevo curso a la plataforma</p>
          </div>
        </Link>
      </div>

      <div className="teacher-stats">
        <StatCard icon="book" value={stats.courses} label="Cursos" />
        <StatCard icon="users" value={stats.students} label="Alumnos" />
        <StatCard icon="check" value={stats.testsCompleted} label="Tests completados" />
      </div>

      {loading ? (
        <div className="teacher-loading">Cargando...</div>
      ) : courses.length === 0 ? (
        <div className="teacher-empty">
          <p>No has creado ningún curso todavía.</p>
          <Link to="/courses/create" className="teacher-link">Crear tu primer curso</Link>
        </div>
      ) : (
        <div className="teacher-courses">
          <div className="teacher-courses-header">
            <h2>Mis cursos</h2>
            <Link to="/courses" className="teacher-link">Ver todos</Link>
          </div>
          <div className="teacher-courses-list">
            {courses.slice(0, 5).map(course => (
              <Link key={course.id} to={`/courses/${course.id}`} className="teacher-course-item">
                <div className="teacher-course-info">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                </div>
                <ChevronRight size={20} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
