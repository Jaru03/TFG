import { wrapController } from '../../middleware/errorHandler.js';
import {
  listLessonsByCourse,
  findLessonById,
  createLesson as createLessonService,
  updateLesson as updateLessonService,
  deleteLesson as deleteLessonService
} from '../../services/lesson.service.js';

import {
  listAttachmentsByLesson,
  createFileAttachment,
  createVideoUrlAttachment,
  deleteAttachment,
} from '../../services/lesson-attachment.service.js';

import {
  markLessonComplete,
  unmarkLessonComplete,
  listCompletedLessonIds,
} from '../../services/lesson-progress.service.js';

async function listLessons(req, res) {
  const { courseId } = req.params;
  const lessons = await listLessonsByCourse(courseId);
  res.json(lessons);
}

async function getLesson(req, res) {
  const lesson = await findLessonById(req.params.id);
  if (!lesson) {
    return res.status(404).json({ message: 'Lección no encontrada' });
  }
  res.json(lesson);
}

async function createLesson(req, res) {
  const { courseId } = req.params;
  const { title, content, orderNumber } = req.body;

  const lesson = await createLessonService({ courseId, title, content, orderNumber });

  res.status(201).json(lesson);
}

async function updateLesson(req, res) {
  const lesson = await findLessonById(req.params.id);
  if (!lesson) {
    return res.status(404).json({ message: 'Lección no encontrada' });
  }

  const { title, content, orderNumber } = req.body;
  const updated = await updateLessonService(req.params.id, {
    title,
    content,
    orderNumber: orderNumber ?? lesson.order_number
  });

  res.json(updated);
}

async function deleteLesson(req, res) {
  await deleteLessonService(req.params.id);
  res.status(204).end();
}

async function getAttachments(req, res) {
  const attachments = await listAttachmentsByLesson(req.params.id);
  res.json(attachments);
}

async function uploadAttachment(req, res) {
  const { id: lessonId } = req.params;

  if (req.file) {
    const url = `/uploads/lessons/${req.file.filename}`;
    const attachment = await createFileAttachment({
      lessonId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      url,
    });
    return res.status(201).json(attachment);
  }

  if (req.body.videoUrl) {
    const attachment = await createVideoUrlAttachment({ lessonId, url: req.body.videoUrl });
    return res.status(201).json(attachment);
  }

  res.status(400).json({ message: 'Se requiere un archivo o URL de vídeo.' });
}

async function removeAttachment(req, res) {
  await deleteAttachment(req.params.attachmentId);
  res.status(204).end();
}

// ── Progreso de lecciones (alumno) ──────────────────────────────────────────

async function completeLesson(req, res) {
  await markLessonComplete(req.user.id, req.params.id);
  res.status(201).json({ completed: true });
}

async function uncompleteLesson(req, res) {
  await unmarkLessonComplete(req.user.id, req.params.id);
  res.status(204).end();
}

async function getCompletedLessons(req, res) {
  const ids = await listCompletedLessonIds(req.user.id, req.params.courseId);
  res.json(ids);
}

export default wrapController({
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
});
