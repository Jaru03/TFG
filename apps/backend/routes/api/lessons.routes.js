import express from 'express';
import { isAuthenticated, requireRole } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import { validateBody } from '../../middleware/validate.js';
import { createLessonSchema, updateLessonSchema } from '../../validators/schemas.js';
import lessonsController from '../../controllers/api/lessons.controller.js';

const router = express.Router({ mergeParams: true });
const {
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  getAttachments,
  uploadAttachment,
  removeAttachment,
  completeLesson,
  uncompleteLesson,
  getCompletedLessons,
} = lessonsController;

router.get('/', isAuthenticated, listLessons);
router.post('/', isAuthenticated, requireRole('profesor'), validateBody(createLessonSchema), createLesson);

// Lecciones completadas por el usuario en el curso (debe ir antes de /:id)
router.get('/completed', isAuthenticated, getCompletedLessons);

// Attachment delete (must be before /:id to avoid conflict)
router.delete('/attachments/:attachmentId', isAuthenticated, requireRole('profesor'), removeAttachment);

router.get('/:id', isAuthenticated, getLesson);
router.put('/:id', isAuthenticated, requireRole('profesor'), validateBody(updateLessonSchema), updateLesson);
router.delete('/:id', isAuthenticated, requireRole('profesor'), deleteLesson);

// Marcar / desmarcar lección como completada (alumno)
router.post('/:id/complete', isAuthenticated, completeLesson);
router.delete('/:id/complete', isAuthenticated, uncompleteLesson);

// Attachments
router.get('/:id/attachments', isAuthenticated, getAttachments);
router.post('/:id/attachments', isAuthenticated, requireRole('profesor'), upload.single('file'), uploadAttachment);

export default router;
