import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { validateBody } from '../middleware/validate.js';
import {
  adminLoginSchema,
  courseSchema,
  createLessonSchema,
  updateLessonSchema,
  createTestSchema,
  updateTestSchema,
  questionSchema,
  updateUserSchema,
  changeRoleSchema,
} from '../validators/schemas.js';

const router = express.Router();
const {
  loginAdmin,
  logoutAdmin,
  getAdminMe,
  getStats,
  listAdminUsers,
  updateAdminUser,
  changeAdminUserRole,
  deleteAdminUser,
  listAdminCourses,
  getAdminCourse,
  getAdminCourseStats,
  getAdminCourseStudents,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  listAdminLessons,
  createAdminLesson,
  updateAdminLesson,
  deleteAdminLesson,
  listAdminTests,
  createAdminTest,
  updateAdminTest,
  deleteAdminTest,
  listAdminQuestions,
  createAdminQuestion,
  updateAdminQuestion,
  deleteAdminQuestion,
} = adminController;

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/login',  validateBody(adminLoginSchema), loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/me',      requireAdmin, getAdminMe);

// ── Stats ─────────────────────────────────────────────────────────────────────
router.get('/stats', requireAdmin, getStats);

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users',             requireAdmin, listAdminUsers);
router.put('/users/:id',         requireAdmin, validateBody(updateUserSchema), updateAdminUser);
router.put('/users/:id/role',    requireAdmin, validateBody(changeRoleSchema), changeAdminUserRole);
router.delete('/users/:id',      requireAdmin, deleteAdminUser);

// ── Courses ───────────────────────────────────────────────────────────────────
router.get('/courses',            requireAdmin, listAdminCourses);
router.post('/courses',           requireAdmin, validateBody(courseSchema), createAdminCourse);
router.get('/courses/:id/stats',  requireAdmin, getAdminCourseStats);
router.get('/courses/:id/students-progress', requireAdmin, getAdminCourseStudents);
router.get('/courses/:id',        requireAdmin, getAdminCourse);
router.put('/courses/:id',        requireAdmin, validateBody(courseSchema), updateAdminCourse);
router.delete('/courses/:id',     requireAdmin, deleteAdminCourse);

// ── Lessons (nested under course) ─────────────────────────────────────────────
router.get('/courses/:courseId/lessons',  requireAdmin, listAdminLessons);
router.post('/courses/:courseId/lessons', requireAdmin, validateBody(createLessonSchema), createAdminLesson);
router.put('/lessons/:id',               requireAdmin, validateBody(updateLessonSchema), updateAdminLesson);
router.delete('/lessons/:id',            requireAdmin, deleteAdminLesson);

// ── Tests (nested under course) ───────────────────────────────────────────────
router.get('/courses/:courseId/tests',  requireAdmin, listAdminTests);
router.post('/courses/:courseId/tests', requireAdmin, validateBody(createTestSchema), createAdminTest);
router.put('/tests/:id',                requireAdmin, validateBody(updateTestSchema), updateAdminTest);
router.delete('/tests/:id',             requireAdmin, deleteAdminTest);

// ── Questions (nested under test) ─────────────────────────────────────────────
router.get('/tests/:testId/questions',  requireAdmin, listAdminQuestions);
router.post('/tests/:testId/questions', requireAdmin, validateBody(questionSchema), createAdminQuestion);
router.put('/questions/:id',            requireAdmin, validateBody(questionSchema), updateAdminQuestion);
router.delete('/questions/:id',         requireAdmin, deleteAdminQuestion);

export default router;
