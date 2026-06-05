import express from 'express';
import coursesController from '../../controllers/api/courses.controller.js';
import { isAuthenticated, requireRole } from '../../middleware/auth.js';
import { courseUpload } from '../../middleware/upload.js';
import { validateBody } from '../../middleware/validate.js';
import { courseSchema } from '../../validators/schemas.js';

const router = express.Router();
const {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getStats,
  getCourseStats,
  getCourseStudents,
  listEnrolledCourses,
  enroll,
  checkEnrollment
} = coursesController;

router.get('/', isAuthenticated, listCourses);
router.get('/stats', isAuthenticated, requireRole('profesor', 'administrador'), getStats);
router.get('/enrolled', isAuthenticated, listEnrolledCourses);
router.get('/:id', isAuthenticated, getCourse);
router.get('/:id/stats', isAuthenticated, getCourseStats);
router.get('/:id/students-progress', isAuthenticated, requireRole('profesor'), getCourseStudents);
router.get('/:id/enrollment', isAuthenticated, checkEnrollment);
router.post('/', isAuthenticated, requireRole('profesor'), courseUpload.single('cover'), validateBody(courseSchema), createCourse);
router.put('/:id', isAuthenticated, requireRole('profesor'), courseUpload.single('cover'), validateBody(courseSchema), updateCourse);
router.delete('/:id', isAuthenticated, requireRole('profesor'), deleteCourse);
router.post('/:id/enroll', isAuthenticated, enroll);

export default router;
