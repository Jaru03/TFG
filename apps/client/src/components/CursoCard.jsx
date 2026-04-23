import { Link } from "react-router-dom";
import "./CursoCard.css";

const CursoCard = ({ course }) => {
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
      </div>
    </Link>
  );
};

export default CursoCard;
