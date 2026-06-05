import express from 'express';
import { isAuthenticated, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { questionSchema } from '../../validators/schemas.js';
import questionsController from '../../controllers/api/questions.controller.js';

const router = express.Router({ mergeParams: true });
const {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = questionsController;

router.get('/', isAuthenticated, listQuestions);
router.post('/', isAuthenticated, requireRole('profesor'), validateBody(questionSchema), createQuestion);
router.put('/:id', isAuthenticated, requireRole('profesor'), validateBody(questionSchema), updateQuestion);
router.delete('/:id', isAuthenticated, requireRole('profesor'), deleteQuestion);

export default router;
