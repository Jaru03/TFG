import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Button from '../../components/Button';
import CursoCard from '../../components/CursoCard';
import './CoursesPage.css';

export default function CoursesPage({ user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/courses');
        setCourses(res.data);
      } catch (err) {
        setError('Error al cargar los cursos.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const instructors = [...new Set(courses.map(c => c.instructor).filter(Boolean))];
    return instructors;
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || course.instructor === category;
      return matchesSearch && matchesCategory;
    });
  }, [courses, search, category]);

  return (
    <main className="courses-page">
      <div className="courses-page-container">
        <div className="courses-page-toolbar">
          <h1>Cursos</h1>
          <div className="courses-toolbar-right">
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="courses-search"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="courses-select"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {(user.role === 'profesor' || user.role === 'administrador') && (
              <Button to="/courses/create">Crear</Button>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <div className="courses-loading">Cargando cursos...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="courses-empty">No hay cursos disponibles.</div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <CursoCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
