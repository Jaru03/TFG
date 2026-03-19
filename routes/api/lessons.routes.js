const express = require('express');
const router = express.Router({ mergeParams: true });

const { isAuthenticated, requireRole } = require('../../middleware/auth');
const {
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson
} = require('../../controllers/api/lessons.controller');

router.get('/', isAuthenticated, listLessons);
router.get('/:id', isAuthenticated, getLesson);
router.post('/', isAuthenticated, requireRole('profesor'), createLesson);
router.put('/:id', isAuthenticated, requireRole('profesor'), updateLesson);
router.delete('/:id', isAuthenticated, requireRole('profesor'), deleteLesson);

module.exports = router;
