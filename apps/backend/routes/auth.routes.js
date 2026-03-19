const express = require('express');
const passport = require('passport');
const router = express.Router();

const { logout, authCallback, authFailure } = require('../controllers/auth.controller');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure', failureFlash: true }),
  authCallback
);

router.get('/failure', authFailure);
router.get('/logout', logout);

module.exports = router;
