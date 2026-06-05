import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { coursesApi } from "../../api";
import CursoCard from "../CursoCard";
import Loading from "../Loading";
import EmptyState from "../EmptyState";
import "./CoursesSection.css";

const CoursesSection = () => {
  const { data: courses = [], isLoading: loading } = useQuery({
    queryKey: ["courses"],
    queryFn: coursesApi.list,
  });

  return (
    <section className="courses-section">
      <div className="courses-section-header">
        <h2>Cursos</h2>
        <Link to="/courses" className="courses-link">Ver todo</Link>
      </div>
      <div className="courses-grid">
        {loading ? (
          <Loading className="courses-span" message="Cargando cursos..." />
        ) : courses.length === 0 ? (
          <EmptyState className="courses-span" message="No hay cursos disponibles" />
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
