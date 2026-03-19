function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ message: 'No autenticado. Debes iniciar sesión.' });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: 'No autenticado. Debes iniciar sesión.' });
    }

    const userRole = req.user && req.user.role;
    if (userRole === role || userRole === 'administrador') {
      return next();
    }

    res.status(403).json({ message: 'No tienes permisos para acceder a este recurso.' });
  };
}

module.exports = { isAuthenticated, requireRole };
