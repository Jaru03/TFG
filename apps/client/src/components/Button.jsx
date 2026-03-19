import { Link } from 'react-router-dom';

export default function Button({ children, variant = 'primary', to, type = 'button', onClick, ...props }) {
  const className = `button${variant === 'secondary' ? ' secondary' : ''}`;

  if (to) {
    return <Link className={className} to={to} {...props}>{children}</Link>;
  }

  return (
    <button className={className} type={type} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
