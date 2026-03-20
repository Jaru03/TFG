import { Link } from "react-router-dom";
import "./CursoCard.css";

const CursoCard = ({ course, image }) => {
  return (
    <Link to={`/courses/${course.id}`} className="curso-card">
      <div className="curso-card-image">
        <img src={image || "https://img-c.udemycdn.com/course/480x270/6795483_a223_2.jpg?w=3840&q=75"} alt={course.title} />
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
