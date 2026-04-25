const express = require('express');
const router = express.Router({ mergeParams: true });

const { isAuthenticated, requireRole } = require('../../middleware/auth');
const { upload } = require('../../middleware/upload');
const {
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  getAttachments,
  uploadAttachment,
  removeAttachment,
} = require('../../controllers/api/lessons.controller');

router.get('/', isAuthenticated, listLessons);
router.post('/', isAuthenticated, requireRole('profesor'), createLesson);

// Attachment delete (must be before /:id to avoid conflict)
router.delete('/attachments/:attachmentId', isAuthenticated, requireRole('profesor'), removeAttachment);

router.get('/:id', isAuthenticated, getLesson);
router.put('/:id', isAuthenticated, requireRole('profesor'), updateLesson);
router.delete('/:id', isAuthenticated, requireRole('profesor'), deleteLesson);

// Attachments
router.get('/:id/attachments', isAuthenticated, getAttachments);
router.post('/:id/attachments', isAuthenticated, requireRole('profesor'), upload.single('file'), uploadAttachment);

module.exports = router;
