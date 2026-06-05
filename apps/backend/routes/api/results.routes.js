import express from 'express';
import { isAuthenticated, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { submitTestSchema } from '../../validators/schemas.js';
import resultsController from '../../controllers/api/results.controller.js';

const router = express.Router();
const { submitTest, getAttempts, listMyResults, getResultsByTest } = resultsController;

router.post('/tests/:id/submit', isAuthenticated, validateBody(submitTestSchema), submitTest);
router.get('/tests/:id/attempts', isAuthenticated, getAttempts);
router.get('/me', isAuthenticated, listMyResults);
router.get('/tests/:id', isAuthenticated, requireRole('administrador'), getResultsByTest);

export default router;
