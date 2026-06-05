import { Link } from "react-router-dom";
import "./CursoCard.css";

const CursoCard = ({ course }) => {
  // El progreso solo viene en cursos inscritos ("Mis cursos"). Se combina
  // lecciones completadas + tests realizados sobre el total del curso.
  const hasProgress = course.total_lessons !== undefined;
  const total = (course.total_lessons || 0) + (course.total_tests || 0);
  const completed = (course.completed_lessons || 0) + (course.completed_tests || 0);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Link to={`/courses/${course.id}`} className="curso-card">
      <div className={`curso-card-image ${!course.cover_image ? 'curso-card-image--placeholder' : ''}`}>
        {course.cover_image
          ? <img src={course.cover_image} alt={course.title} />
          : <span className="curso-card-initials">{course.title.charAt(0).toUpperCase()}</span>
        }
      </div>
      <div className="curso-card-content">
        <h3>{course.title}</h3>
        <p className="curso-card-instructor">{course.instructor || "Profesor"}</p>
        <p className="curso-card-description">{course.description}</p>

        {hasProgress && total > 0 && (
          <div className="curso-card-progress">
            <div className="curso-card-progress-track">
              <div
                className={`curso-card-progress-fill ${pct === 100 ? 'done' : ''}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="curso-card-progress-label">{pct}%</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default CursoCard;
