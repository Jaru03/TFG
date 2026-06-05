import { wrapController } from '../../middleware/errorHandler.js';
import {
  listCourses as listCoursesService,
  findCourseById,
  createCourse as createCourseService,
  updateCourse as updateCourseService,
  deleteCourse as deleteCourseService,
  getTeacherStats,
  getCourseStats as getCourseStatsService,
  getStudentsProgress as getStudentsProgressService,
  getEnrolledCourses as getEnrolledCoursesService,
  enrollUser,
  isEnrolled
} from '../../services/course.service.js';

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
  const coverImage = req.file ? `/uploads/courses/${req.file.filename}` : null;

  const course = await createCourseService({
    title,
    description,
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
  const coverImage = req.file ? `/uploads/courses/${req.file.filename}` : undefined;

  const updated = await updateCourseService(req.params.id, {
    title,
    description,
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

async function getCourseStudents(req, res) {
  const course = await findCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ message: 'Curso no encontrado' });
  }

  if (req.user.role !== 'administrador' && course.created_by !== req.user.id) {
    return res.status(403).json({ message: 'No autorizado' });
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const result = await getStudentsProgressService(req.params.id, page, limit);
  res.json(result);
}

async function enroll(req, res) {
  await enrollUser(req.user.id, req.params.id);
  res.status(201).json({ message: 'Inscripción exitosa' });
}

async function listEnrolledCourses(req, res) {
  const courses = await getEnrolledCoursesService(req.user.id);
  res.json(courses);
}

async function checkEnrollment(req, res) {
  const enrolled = await isEnrolled(req.user.id, req.params.id);
  res.json({ enrolled });
}

export default wrapController({
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
});
