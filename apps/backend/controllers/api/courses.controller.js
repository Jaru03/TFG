const {
  listCourses: listCoursesService,
  findCourseById,
  createCourse: createCourseService,
  updateCourse: updateCourseService,
  deleteCourse: deleteCourseService,
  getTeacherStats,
  getCourseStats: getCourseStatsService,
  getEnrolledCourses: getEnrolledCoursesService,
  enrollUser,
  isEnrolled
} = require('../../services/course.service');

async function listCourses(req, res) {
  const courses = await listCoursesService();
  res.json(courses);
}

async function getCourse(req, res) {
  const course = await findCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: 'Curso no encontrado' });
  }
  res.json(course);
}

async function createCourse(req, res) {
  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'El título es obligatorio.' });
  }

  const coverImage = req.file ? `/uploads/courses/${req.file.filename}` : null;

  const course = await createCourseService({
    title: title.trim(),
    description: description ? description.trim() : '',
    createdBy: req.user.id,
    coverImage,
  });

  res.status(201).json(course);
}

async function updateCourse(req, res) {
  const course = await findCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: 'Curso no encontrado' });
  }

  if (req.user.role !== 'administrador' && course.created_by !== req.user.id) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'El título es obligatorio.' });
  }

  const coverImage = req.file ? `/uploads/courses/${req.file.filename}` : undefined;

  const updated = await updateCourseService(req.params.id, {
    title: title.trim(),
    description: description ? description.trim() : '',
    coverImage,
  });

  res.json(updated);
}

async function deleteCourse(req, res) {
  const course = await findCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: 'Curso no encontrado' });
  }

  if (req.user.role !== 'administrador' && course.created_by !== req.user.id) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  await deleteCourseService(req.params.id);

  res.status(204).end();
}

async function getStats(req, res) {
  const stats = await getTeacherStats(req.user.id);
  res.json(stats);
}

async function getCourseStats(req, res) {
  const course = await findCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: 'Curso no encontrado' });
  }

  if (req.user.role !== 'administrador' && course.created_by !== req.user.id) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  const stats = await getCourseStatsService(req.params.id);
  res.json(stats);
}

async function enroll(req, res) {
  try {
    await enrollUser(req.user.id, req.params.id);
    res.status(201).json({ message: 'Inscripción exitosa' });
  } catch (err) {
    res.status(500).json({ message: 'Error al inscribirse' });
  }
}

async function listEnrolledCourses(req, res) {
  const courses = await getEnrolledCoursesService(req.user.id);
  res.json(courses);
}

async function checkEnrollment(req, res) {
  const enrolled = await isEnrolled(req.user.id, req.params.id);
  res.json({ enrolled });
}

module.exports = {
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
};
