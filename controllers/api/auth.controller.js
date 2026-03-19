function getMe(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  const { id, name, email, role } = req.user;
  res.json({ id, name, email, role });
}

module.exports = { getMe };
