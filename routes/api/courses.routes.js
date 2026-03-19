const express = require('express');
const router = express.Router();

const {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../../controllers/api/courses.controller');

const { isAuthenticated, requireRole } = require('../../middleware/auth');

router.get('/', isAuthenticated, listCourses);
router.get('/:id', isAuthenticated, getCourse);
router.post('/', isAuthenticated, requireRole('profesor'), createCourse);
router.put('/:id', isAuthenticated, requireRole('profesor'), updateCourse);
router.delete('/:id', isAuthenticated, requireRole('profesor'), deleteCourse);

module.exports = router;
