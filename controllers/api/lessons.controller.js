const {
  listLessonsByCourse,
  findLessonById,
  createLesson: createLessonService,
  updateLesson: updateLessonService,
  deleteLesson: deleteLessonService
} = require('../../services/lesson.service');

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

module.exports = {
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson
};
