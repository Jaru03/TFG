import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '../../api';
import { ArrowLeft, BookOpen, FileText, Users, Edit, TrendingUp } from 'lucide-react';
import StatCard from '../../components/StatCard';
import StudentsProgressTable from '../../components/StudentsProgressTable';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';
import './CourseDetailTeacher.css';

const CourseDetailTeacher = () => {
  const { id } = useParams();

  const { data: course, isLoading: loadingCourse, error: errorCourse } = useQuery({
    queryKey: ['courses', id],
    queryFn: () => coursesApi.get(id),
  });
  const { data: stats = { students: 0, lessons: 0, tests: 0, avgProgress: 0 }, isLoading: loadingStats, error: errorStats } = useQuery({
    queryKey: ['courses', id, 'stats'],
    queryFn: () => coursesApi.stats(id),
  });

  const loading = loadingCourse || loadingStats;
  const error = errorCourse || errorStats;

  if (loading) {
    return <Loading minHeight="50vh" />;
  }

  if (error) {
    return (
      <div className="container">
        <Alert>Error al cargar el curso.</Alert>
      </div>
    );
  }

  return (
    <div className="course-teacher">
      <div className="course-teacher-container">
        <div className="course-teacher-header">
          <Link to="/" className="course-teacher-back">
            <ArrowLeft size={20} />
            <span>Volver al inicio</span>
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
          <StatCard icon={<Users size={18} />}       value={stats.students}       label="Alumnos inscritos"  iconBg="#eef2ff" iconColor="#6366f1" />
          <StatCard icon={<BookOpen size={18} />}    value={stats.lessons}        label="Lecciones"          iconBg="#dcfce7" iconColor="#16a34a" />
          <StatCard icon={<FileText size={18} />}    value={stats.tests}          label="Tests"              iconBg="#fef3c7" iconColor="#d97706" />
          <StatCard icon={<TrendingUp size={18} />}  value={`${stats.avgProgress}%`} label="Progreso medio"  iconBg="#fce7f3" iconColor="#db2777" />
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

        <div className="course-teacher-students">
          <h2 className="course-teacher-section-title">Seguimiento de alumnos</h2>
          <StudentsProgressTable endpoint={`/api/courses/${id}/students-progress`} />
        </div>
      </div>
    </div>
  );
};

export default CourseDetailTeacher;
