import { Users, BookOpen, CheckCircle, FileText } from 'lucide-react';
import './StatCard.css';

const StatCard = ({ icon, value, label }) => {
  const IconComponent = {
    users: Users,
    book: BookOpen,
    check: CheckCircle,
    file: FileText
  }[icon] || BookOpen;

  return (
    <div className="stat-card">
      <IconComponent size={24} className="stat-card-icon" />
      <div className="stat-card-content">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
      </div>
    </div>
  );
};

export default StatCard;
