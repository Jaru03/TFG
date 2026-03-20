const express = require('express');
const router = express.Router();

const {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getStats,
  getCourseStats,
  enroll,
  checkEnrollment
} = require('../../controllers/api/courses.controller');

const { isAuthenticated, requireRole } = require('../../middleware/auth');

router.get('/', isAuthenticated, listCourses);
router.get('/stats', isAuthenticated, requireRole('profesor', 'administrador'), getStats);
router.get('/:id', isAuthenticated, getCourse);
router.get('/:id/stats', isAuthenticated, getCourseStats);
router.get('/:id/enrollment', isAuthenticated, checkEnrollment);
router.post('/', isAuthenticated, requireRole('profesor'), createCourse);
router.put('/:id', isAuthenticated, requireRole('profesor'), updateCourse);
router.delete('/:id', isAuthenticated, requireRole('profesor'), deleteCourse);
router.post('/:id/enroll', isAuthenticated, enroll);

module.exports = router;
