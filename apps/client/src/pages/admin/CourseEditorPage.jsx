import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api';
import CourseEditor from './course-editor';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

// Carga un curso por id (deep-link a /admin/courses/:id) y renderiza el editor.
export default function CourseEditorPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data: course, error } = useQuery({
    queryKey: ['admin', 'course', courseId],
    queryFn: () => adminApi.course(courseId),
  });

  if (error) return <Alert>No se pudo cargar el curso.</Alert>;
  if (!course) return <Loading minHeight="200px" message="Cargando curso…" />;

  return (
    <CourseEditor
      course={course}
      onBack={() => navigate('/admin/courses')}
      onSaved={() => {}}
    />
  );
}
