import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { http } from '../api';
import EmptyState from './EmptyState';
import Loading from './Loading';
import './StudentsProgressTable.css';

const LIMIT = 10;

// Tabla de seguimiento de alumnos con paginación en servidor, compartida entre
// la vista del profesor y el panel de administración. Recibe el `endpoint`
// (la API difiere según el rol) y pide una página cada vez.
export default function StudentsProgressTable({ endpoint }) {
  const [page, setPage] = useState(1);

  const { data = { students: [], total: 0 }, isLoading: loading, error } = useQuery({
    queryKey: [endpoint, page],
    queryFn: () =>
      http.get(`${endpoint}?page=${page}&limit=${LIMIT}`).then((r) => r.data),
  });

  const { students, total } = data;
  const totalPages = Math.max(Math.ceil(total / LIMIT), 1);

  if (loading) return <Loading minHeight="160px" />;
  if (error) return <EmptyState boxed message="No se pudo cargar el seguimiento de alumnos." />;
  if (total === 0) return <EmptyState boxed message="Aún no hay alumnos inscritos en este curso." />;

  return (
    <div>
      <div className="students-progress">
        <table className="students-progress-table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Lecciones</th>
              <th>Tests</th>
              <th>Nota media</th>
              <th className="sp-progress-col">Progreso</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const totalItems = (s.total_lessons || 0) + (s.total_tests || 0);
              const completed = (s.completed_lessons || 0) + (s.completed_tests || 0);
              const pct = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
              return (
                <tr key={s.id}>
                  <td>
                    <div className="sp-student-name">{s.name}</div>
                    <div className="sp-student-email">{s.email}</div>
                  </td>
                  <td>{s.completed_lessons}/{s.total_lessons}</td>
                  <td>{s.completed_tests}/{s.total_tests}</td>
                  <td>{s.avg_score != null ? Number(s.avg_score) : '—'}</td>
                  <td>
                    <div className="sp-progress-cell">
                      <div className="sp-progress-track">
                        <div
                          className={`sp-progress-fill ${pct === 100 ? 'done' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="sp-progress-pct">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="students-progress-pagination">
          <button
            className="sp-page-btn"
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page <= 1}
          >
            <ChevronLeft size={15} /> Anterior
          </button>
          <span className="sp-page-info">Página {page} de {totalPages}</span>
          <button
            className="sp-page-btn"
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
          >
            Siguiente <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
