function logout(req, res) {
  const clientUrl = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect(clientUrl);
    });
  });
}

function authCallback(req, res) {
  const clientUrl = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  res.redirect(clientUrl);
}

function authFailure(req, res) {
  const clientUrl = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  res.redirect(`${clientUrl}?error=auth_failed`);
}

module.exports = {
  logout,
  authCallback,
  authFailure
};
