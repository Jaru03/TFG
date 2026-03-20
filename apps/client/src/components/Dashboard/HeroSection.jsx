import { Link } from "react-router-dom";
import { BookOpen, ClipboardList, TrendingUp } from "lucide-react";
import Button from "../Button";
import CoursesSection from "./CoursesSection";
import "./HeroSection.css";

const HeroSection = ({ user }) => {
  const quickActions = [
    { label: "Ver cursos", to: "/courses", icon: BookOpen },
    { label: "Mis cursos", to: "/courses", icon: BookOpen },
    { label: "Mi progreso", to: "/courses", icon: TrendingUp },
  ];

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-banner">
          <div className="hero-banner-content">
            <h1>Despierta tu potencial,<br />aprende de lo que amas.</h1>
            <p>Accede a cursos de alta calidad, realiza tests interactivos y lleva tu aprendizaje al siguiente nivel.</p>
            <Button to="/courses">Explorar cursos</Button>
          </div>
          <div className="hero-banner-image">
            <img src="/hero.png" alt="Hero" />
          </div>
        </div>

        <div className="hero-quick-actions">
          <div className="hero-actions">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.to} className="hero-action-card">
                <action.icon size={24} className="hero-action-icon" />
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <CoursesSection />
    </section>
  );
};

export default HeroSection;
