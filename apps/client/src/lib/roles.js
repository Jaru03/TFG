// Roles de la plataforma y helpers compartidos.
export const ROLES = {
  ALUMNO: 'alumno',
  PROFESOR: 'profesor',
  ADMIN: 'administrador',
};

// ¿El usuario puede gestionar contenido (profesor o administrador)?
// El check `user.role === 'profesor' || === 'administrador'` estaba repetido
// en media docena de componentes; esta es la única fuente de verdad.
export function isTeacher(user) {
  return !!user && (user.role === ROLES.PROFESOR || user.role === ROLES.ADMIN);
}
