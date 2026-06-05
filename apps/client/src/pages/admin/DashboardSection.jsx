import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Users, BookOpen, GraduationCap, Award, UserCircle2 } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';

const ROLE_COLORS = {
  alumno:        '#6366f1',
  profesor:      '#f59e0b',
  administrador: '#8b5cf6',
};

const ROLE_LABELS = {
  alumno:        'Alumnos',
  profesor:      'Profesores',
  administrador: 'Admins',
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div style={{
      background: '#18181b',
      border: '1px solid #27272a',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: '0.8rem',
      color: '#f4f4f5',
    }}>
      <div style={{ fontWeight: 600 }}>{ROLE_LABELS[name] ?? name}</div>
      <div style={{ color: '#a1a1aa' }}>{value} usuarios</div>
    </div>
  );
}

function RecentRow({ left, right, sub }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid #f4f4f5',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#eef2ff', color: '#6366f1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
        }}>
          {left?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <div style={{ fontSize: '0.83rem', fontWeight: 500, color: '#18181b' }}>{left}</div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>{sub}</div>
        </div>
      </div>
      <span style={{ fontSize: '0.75rem', color: '#a1a1aa', whiteSpace: 'nowrap', marginLeft: 12 }}>{right}</span>
    </div>
  );
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export default function DashboardSection() {
  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.stats,
  });

  if (loading) return <Loading minHeight="200px" />;

  const chartData = (stats?.roleBreakdown ?? []).map(r => ({
    name:  r.role,
    value: r.count,
  }));

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen general de la plataforma</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="admin-stats-grid">
        <StatCard icon={<Users size={18} />}         label="Usuarios"      value={stats?.users       ?? 0} iconBg="#eef2ff" iconColor="#6366f1" />
        <StatCard icon={<BookOpen size={18} />}      label="Cursos"        value={stats?.courses     ?? 0} iconBg="#dcfce7" iconColor="#16a34a" />
        <StatCard icon={<GraduationCap size={18} />} label="Inscripciones" value={stats?.enrollments ?? 0} iconBg="#fef3c7" iconColor="#d97706" />
        <StatCard icon={<Award size={18} />}         label="Nota media"    value={stats?.avgScore    ?? 0} iconBg="#fce7f3" iconColor="#db2777" />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Chart */}
        <div className="admin-quick-card">
          <h3 style={{ marginBottom: 20 }}>Usuarios por rol</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barCategoryGap="35%" margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tickFormatter={n => ROLE_LABELS[n] ?? n}
                tick={{ fontSize: 12, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map(entry => (
                  <Cell key={entry.name} fill={ROLE_COLORS[entry.name] ?? '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Recent users */}
          <div className="admin-quick-card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <UserCircle2 size={15} style={{ color: '#6366f1' }} />
              <h3 style={{ margin: 0 }}>Últimos registros</h3>
            </div>
            {(stats?.recentUsers ?? []).length === 0 ? (
              <p style={{ color: '#a1a1aa', fontSize: '0.82rem', marginTop: 12 }}>Sin usuarios todavía</p>
            ) : (
              <div>
                {(stats?.recentUsers ?? []).map((u, i) => (
                  <RecentRow
                    key={i}
                    left={u.name}
                    sub={u.role}
                    right={formatDate(u.created_at)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent courses */}
          <div className="admin-quick-card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <BookOpen size={15} style={{ color: '#16a34a' }} />
              <h3 style={{ margin: 0 }}>Últimos cursos</h3>
            </div>
            {(stats?.recentCourses ?? []).length === 0 ? (
              <p style={{ color: '#a1a1aa', fontSize: '0.82rem', marginTop: 12 }}>Sin cursos todavía</p>
            ) : (
              <div>
                {(stats?.recentCourses ?? []).map((c, i) => (
                  <RecentRow
                    key={i}
                    left={c.title}
                    sub={c.instructor ?? 'Sin instructor'}
                    right={formatDate(c.created_at)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
