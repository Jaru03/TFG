const express = require('express');
const passport = require('passport');
const router = express.Router();

const { logout, authCallback, authFailure } = require('../controllers/auth.controller');

function resolveBaseUrl(req) {
  const rawHost  = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const rawProto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host  = rawHost.split(',')[0].trim();
  const proto = host.includes('ngrok') ? 'https' : rawProto.split(',')[0].trim();
  return `${proto}://${host}`;
}

router.get('/google', (req, res, next) => {
  const role = req.query.role === 'profesor' ? 'profesor' : 'alumno';
  req.session.pendingRole = role;

  const base = resolveBaseUrl(req);
  req.session.authOrigin = base;
  const callbackURL = `${base}/auth/google/callback`;

  passport.authenticate('google', { scope: ['profile', 'email'], callbackURL })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  const base = resolveBaseUrl(req);
  const callbackURL = `${base}/auth/google/callback`;

  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
    failureFlash: true,
    callbackURL,
  })(req, res, next);
}, authCallback);

router.get('/failure', authFailure);
router.get('/logout', logout);

module.exports = router;
