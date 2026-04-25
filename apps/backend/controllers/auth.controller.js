function resolveClient(req) {
  const rawHost  = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const rawProto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host  = rawHost.split(',')[0].trim();
  const proto = host.includes('ngrok') ? 'https' : rawProto.split(',')[0].trim();
  if (host && !host.startsWith('localhost') && !host.startsWith('127.')) {
    return `${proto}://${host}`;
  }
  return process.env.CLIENT_ORIGIN || 'http://localhost:5173';
}

function logout(req, res) {
  const clientUrl = resolveClient(req);
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect(clientUrl);
    });
  });
}

function authCallback(req, res) {
  const clientUrl = resolveClient(req);
  res.redirect(clientUrl);
}

function authFailure(req, res) {
  const clientUrl = resolveClient(req);
  res.redirect(`${clientUrl}?error=auth_failed`);
}

module.exports = {
  logout,
  authCallback,
  authFailure
};
