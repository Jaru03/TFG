const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

function logout(req, res) {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect(CLIENT_ORIGIN);
    });
  });
}

function authCallback(req, res) {
  res.redirect(CLIENT_ORIGIN);
}

function authFailure(req, res) {
  res.redirect(`${CLIENT_ORIGIN}?error=auth_failed`);
}

export default { logout, authCallback, authFailure };
