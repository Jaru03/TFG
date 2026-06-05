import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api';
import { Trash2, ClipboardList } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import Alert from '../../components/Alert';

function TestRow({ test, onDelete }) {
  return (
    <tr>
      <td className="admin-name">{test.title}</td>
      <td className="admin-muted">{test.course_title}</td>
      <td className="admin-muted">
        {test.description?.slice(0, 60) || <span style={{ color: '#d4d4d8' }}>Sin descripción</span>}
      </td>
      <td>
        <div className="admin-actions">
          <button
            className="admin-btn-icon"
            onClick={() => onDelete(test.id)}
            title="Eliminar test"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function TestsSection() {
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const { data: tests = [], isLoading: loading, error: loadError } = useQuery({
    queryKey: ['admin', 'tests'],
    queryFn: adminApi.tests,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.removeTest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'tests'] }),
    onError: () => setError('No se pudo eliminar el test.'),
  });

  const handleDelete = (id) => {
    if (!window.confirm('¿Eliminar este test? Se eliminarán también sus preguntas.')) return;
    deleteMutation.mutate(id);
  };

  const filtered = tests.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.course_title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading minHeight="200px" message="Cargando tests…" />;

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h1>Tests</h1>
          <p>{tests.length} tests en la plataforma</p>
        </div>
      </div>

      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
        <StatCard icon={<ClipboardList size={18} />} label="Total tests" value={tests.length} iconBg="#eef2ff" iconColor="#6366f1" />
        <StatCard icon={<ClipboardList size={18} />} label="Cursos con tests" value={new Set(tests.map(t => t.course_title)).size} iconBg="#dcfce7" iconColor="#16a34a" />
      </div>

      {(error || loadError) && <Alert>{error || 'No se pudieron cargar los tests.'}</Alert>}

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Buscar por título o curso…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Curso</th>
              <th>Descripción</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="admin-empty">Sin resultados</td></tr>
            ) : (
              filtered.map(t => (
                <TestRow key={t.id} test={t} onDelete={handleDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
