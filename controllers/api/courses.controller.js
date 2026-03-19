const {
  listCourses: listCoursesService,
  findCourseById,
  createCourse: createCourseService,
  updateCourse: updateCourseService,
  deleteCourse: deleteCourseService
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

  const course = await createCourseService({
    title: title.trim(),
    description: description ? description.trim() : '',
    createdBy: req.user.id
  });

  res.status(201).json(course);
}

async function updateCourse(req, res) {
  const course = await findCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: 'Curso no encontrado' });
  }

  // Solo permite editar si es creador o admin
  if (req.user.role !== 'administrador' && course.created_by !== req.user.id) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'El título es obligatorio.' });
  }

  const updated = await updateCourseService(req.params.id, {
    title: title.trim(),
    description: description ? description.trim() : ''
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

module.exports = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
};
