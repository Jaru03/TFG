import express from 'express';
import { isAuthenticated, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { createTestSchema, updateTestSchema } from '../../validators/schemas.js';
import testsController from '../../controllers/api/tests.controller.js';

const router = express.Router({ mergeParams: true });
const {
  listTests,
  getTest,
  createTest,
  updateTest,
  deleteTest
} = testsController;

router.get('/', isAuthenticated, listTests);
router.get('/:id', isAuthenticated, getTest);
router.post('/', isAuthenticated, requireRole('profesor'), validateBody(createTestSchema), createTest);
router.put('/:id', isAuthenticated, requireRole('profesor'), validateBody(updateTestSchema), updateTest);
router.delete('/:id', isAuthenticated, requireRole('profesor'), deleteTest);

export default router;
