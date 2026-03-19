function loginAdmin(req, res) {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }

  res.status(401).json({ message: 'Credenciales incorrectas' });
}

function logoutAdmin(req, res) {
  req.session.isAdmin = false;
  res.json({ ok: true });
}

function getAdminMe(req, res) {
  res.json({ username: process.env.ADMIN_USER });
}

module.exports = { loginAdmin, logoutAdmin, getAdminMe };
