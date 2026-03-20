import { ShieldCheck } from 'lucide-react';

export default function AdminTopbar({ section, username }) {
  return (
    <header className="admin-topbar">
      <span className="admin-topbar-section">{section}</span>
      <span className="admin-topbar-user">
        <ShieldCheck size={14} />
        {username}
      </span>
    </header>
  );
}
