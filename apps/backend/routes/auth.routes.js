const express = require('express');
const passport = require('passport');
const router = express.Router();

const { logout, authCallback, authFailure } = require('../controllers/auth.controller');

router.get('/google', (req, res, next) => {
  const role = req.query.role === 'profesor' ? 'profesor' : 'alumno';
  req.session.pendingRole = role;
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure', failureFlash: true }),
  authCallback
);

router.get('/failure', authFailure);
router.get('/logout', logout);

module.exports = router;
