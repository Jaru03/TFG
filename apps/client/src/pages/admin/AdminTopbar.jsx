export default function AdminTopbar({ section, username }) {
  return (
    <header className="admin-topbar">
      <span className="admin-topbar-section">{section}</span>
      <div className="admin-topbar-user">
        <div className="admin-topbar-avatar">
          {username?.[0]?.toUpperCase() ?? 'A'}
        </div>
        <span>{username}</span>
      </div>
    </header>
  );
}
