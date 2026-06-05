import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '../../api';
import CursoCard from '../../components/CursoCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import Alert from '../../components/Alert';
import './UserPages.css';

export default function MyCoursesPage() {
  const { data: courses = [], isLoading: loading, error } = useQuery({
    queryKey: ['courses', 'enrolled'],
    queryFn: coursesApi.enrolled,
  });

  return (
    <main className="user-page">
      <div className="user-page-container">
        <div className="user-page-header">
          <h1>Mis cursos</h1>
          <p className="user-page-subtitle">Cursos en los que estás inscrito</p>
        </div>

        {error && <Alert>Error al cargar tus cursos.</Alert>}
        {loading ? (
          <Loading />
        ) : courses.length === 0 ? (
          <EmptyState
            message="No estás inscrito en ningún curso todavía."
            action={<a href="/courses" className="user-page-link">Explorar cursos</a>}
          />
        ) : (
          <div className="user-courses-grid">
            {courses.map((course) => (
              <CursoCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
