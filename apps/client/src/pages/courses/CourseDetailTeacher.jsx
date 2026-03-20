import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookOpen, FileText, Users, Edit, CheckCircle, Clock } from 'lucide-react';
import StatCard from '../../components/Dashboard/StatCard';
import './CourseDetailTeacher.css';

const CourseDetailTeacher = ({ user }) => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [stats, setStats] = useState({ students: 0, lessons: 0, tests: 0, completedTests: 0 });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [courseRes, statsRes] = await Promise.all([
          axios.get(`/api/courses/${id}`),
          axios.get(`/api/courses/${id}/stats`)
        ]);
        setCourse(courseRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setError('Error al cargar el curso.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <div className="course-teacher-loading">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="course-teacher">
      <div className="course-teacher-container">
        <div className="course-teacher-header">
          <Link to="/courses" className="course-teacher-back">
            <ArrowLeft size={20} />
            <span>Volver a cursos</span>
          </Link>
        </div>

        <div className="course-teacher-title">
          <h1>{course.title}</h1>
          <Link to={`/courses/create?edit=${course.id}`} className="course-teacher-edit">
            <Edit size={18} />
            <span>Editar curso</span>
          </Link>
        </div>

        <div className="course-teacher-stats">
          <StatCard icon="users" value={stats.students} label="Alumnos inscritos" />
          <StatCard icon="book" value={stats.lessons} label="Lecciones" />
          <StatCard icon="file" value={stats.tests} label="Tests" />
          <StatCard icon="check" value={stats.completedTests} label="Tests completados" />
        </div>

        <div className="course-teacher-actions">
          <Link to={`/courses/${id}/lessons`} className="course-teacher-action">
            <BookOpen size={24} />
            <div>
              <h3>Gestionar lecciones</h3>
              <p>Añade y edita las lecciones del curso</p>
            </div>
          </Link>
          <Link to={`/courses/${id}/tests`} className="course-teacher-action">
            <FileText size={24} />
            <div>
              <h3>Gestionar tests</h3>
              <p>Crea y modifica los tests del curso</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailTeacher;
