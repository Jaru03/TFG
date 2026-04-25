const {
  listLessonsByCourse,
  findLessonById,
  createLesson: createLessonService,
  updateLesson: updateLessonService,
  deleteLesson: deleteLessonService
} = require('../../services/lesson.service');

const {
  listAttachmentsByLesson,
  createFileAttachment,
  createVideoUrlAttachment,
  deleteAttachment,
} = require('../../services/lesson-attachment.service');

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

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'El título es obligatorio.' });
  }

  const lesson = await createLessonService({
    courseId,
    title: title.trim(),
    content: content ? content.trim() : '',
    orderNumber: orderNumber || 1
  });

  res.status(201).json(lesson);
}

async function updateLesson(req, res) {
  const lesson = await findLessonById(req.params.id);
  if (!lesson) {
    return res.status(404).json({ message: 'Lección no encontrada' });
  }

  const { title, content, orderNumber } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'El título es obligatorio.' });
  }

  const updated = await updateLessonService(req.params.id, {
    title: title.trim(),
    content: content ? content.trim() : '',
    orderNumber: orderNumber || lesson.order_number
  });

  res.json(updated);
}

async function deleteLesson(req, res) {
  await deleteLessonService(req.params.id);
  res.status(204).end();
}

async function getAttachments(req, res) {
  try {
    const attachments = await listAttachmentsByLesson(req.params.id);
    res.json(attachments);
  } catch (err) {
    console.error('getAttachments error:', err.message);
    res.status(500).json({ message: err.message });
  }
}

async function uploadAttachment(req, res) {
  try {
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
  } catch (err) {
    console.error('uploadAttachment error:', err.message);
    res.status(500).json({ message: err.message });
  }
}

async function removeAttachment(req, res) {
  try {
    await deleteAttachment(req.params.attachmentId);
    res.status(204).end();
  } catch (err) {
    console.error('removeAttachment error:', err.message);
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  getAttachments,
  uploadAttachment,
  removeAttachment,
};
