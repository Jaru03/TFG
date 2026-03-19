function logout(req, res) {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
}

function authCallback(req, res) {
  res.redirect('/');
}

function authFailure(req, res) {
  req.flash('error', 'No se ha podido iniciar sesión con Google.');
  res.redirect('/');
}

module.exports = {
  logout,
  authCallback,
  authFailure
};
