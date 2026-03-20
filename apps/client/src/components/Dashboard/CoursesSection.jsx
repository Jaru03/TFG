import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CursoCard from "../CursoCard";
import "./CoursesSection.css";

const CoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/courses");
        setCourses(res.data);
      } catch (err) {
        console.error("Error loading courses", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="courses-section">
      <div className="courses-section-header">
        <h2>Cursos</h2>
        <Link to="/courses" className="courses-link">Ver todo</Link>
      </div>
      <div className="courses-grid">
        {loading ? (
          <div className="courses-loading">Cargando cursos...</div>
        ) : courses.length === 0 ? (
          <div className="courses-empty">No hay cursos disponibles</div>
        ) : (
          courses.slice(0, 4).map((course) => (
            <CursoCard key={course.id} course={course} />
          ))
        )}
      </div>
    </section>
  );
};

export default CoursesSection;
