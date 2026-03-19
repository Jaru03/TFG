const express = require('express');
const router = express.Router({ mergeParams: true });

const { isAuthenticated, requireRole } = require('../../middleware/auth');
const {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../../controllers/api/questions.controller');

router.get('/', isAuthenticated, listQuestions);
router.post('/', isAuthenticated, requireRole('profesor'), createQuestion);
router.put('/:id', isAuthenticated, requireRole('profesor'), updateQuestion);
router.delete('/:id', isAuthenticated, requireRole('profesor'), deleteQuestion);

module.exports = router;
