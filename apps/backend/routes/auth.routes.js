import express from 'express';
import passport from 'passport';
import authController from '../controllers/auth.controller.js';

const router = express.Router();
const { logout, authCallback, authFailure } = authController;

router.get('/google', (req, res, next) => {
  const role = req.query.role === 'profesor' ? 'profesor' : 'alumno';
  req.session.pendingRole = role;
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure',
  }),
  authCallback
);

router.get('/failure', authFailure);
router.get('/logout', logout);

export default router;
