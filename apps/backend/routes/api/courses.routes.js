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
  listEnrolledCourses,
  enroll,
  checkEnrollment
} = require('../../controllers/api/courses.controller');

const { isAuthenticated, requireRole } = require('../../middleware/auth');
const { courseUpload } = require('../../middleware/upload');

router.get('/', isAuthenticated, listCourses);
router.get('/stats', isAuthenticated, requireRole('profesor', 'administrador'), getStats);
router.get('/enrolled', isAuthenticated, listEnrolledCourses);
router.get('/:id', isAuthenticated, getCourse);
router.get('/:id/stats', isAuthenticated, getCourseStats);
router.get('/:id/enrollment', isAuthenticated, checkEnrollment);
router.post('/', isAuthenticated, requireRole('profesor'), courseUpload.single('cover'), createCourse);
router.put('/:id', isAuthenticated, requireRole('profesor'), courseUpload.single('cover'), updateCourse);
router.delete('/:id', isAuthenticated, requireRole('profesor'), deleteCourse);
router.post('/:id/enroll', isAuthenticated, enroll);

module.exports = router;
