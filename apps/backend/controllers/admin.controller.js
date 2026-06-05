import { wrapController } from '../middleware/errorHandler.js';
import prisma from '../config/prisma.js';

import {
  listUsers,
  updateRole,
  updateUser,
  findById,
  deleteUserById,
} from '../services/user.service.js';
import {
  listCourses,
  findCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  getStudentsProgress,
} from '../services/course.service.js';
import {
  listLessonsByCourse,
  findLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../services/lesson.service.js';
import {
  listTestsByCourse,
  findTestById,
  createTest,
  updateTest,
  deleteTest,
} from '../services/test.service.js';
import {
  listQuestionsWithPoints,
  validateCustomPoints,
  findQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../services/question.service.js';

// ── Auth ──────────────────────────────────────────────────────────────────────

function loginAdmin(req, res) {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ message: 'Credenciales incorrectas' });
}

function logoutAdmin(req, res) {
  req.session.isAdmin = false;
  res.json({ ok: true });
}

function getAdminMe(req, res) {
  res.json({ username: process.env.ADMIN_USER });
}

// ── Stats ─────────────────────────────────────────────────────────────────────

async function getStats(req, res) {
  const [users, courses, tests, results, enrollments, allResults, roles, recentUsers, recentCourses] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.test.count(),
    prisma.result.count(),
    prisma.userCourse.count(),
    // Para la nota media global: necesitamos el mejor intento de cada (alumno, test).
    prisma.result.findMany({ select: { userId: true, testId: true, score: true } }),
    // Para el desglose por rol: cada rol con su contador de usuarios.
    prisma.role.findMany({ include: { _count: { select: { users: true } } } }),
    prisma.user.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      include: { role: { select: { name: true } } },
    }),
    prisma.course.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { name: true } } },
    }),
  ]);

  // Nota media global: para cada (alumno, test) se toma el mejor intento, luego se promedian.
  const bestMap = new Map();
  for (const r of allResults) {
    const key = `${r.userId}:${r.testId}`;
    const prev = bestMap.get(key) ?? -Infinity;
    if (Number(r.score) > prev) bestMap.set(key, Number(r.score));
  }
  const bestValues = [...bestMap.values()];
  const avgScore = bestValues.length
    ? Math.round(bestValues.reduce((a, b) => a + b, 0) / bestValues.length * 100) / 100
    : 0;

  res.json({
    users,
    courses,
    tests,
    results,
    enrollments,
    avgScore,
    roleBreakdown: roles.map(r => ({ role: r.name, count: r._count.users })),
    recentUsers: recentUsers.map(u => ({ name: u.name, email: u.email, role: u.role.name, created_at: u.createdAt })),
    recentCourses: recentCourses.map(c => ({ title: c.title, instructor: c.creator?.name ?? null, created_at: c.createdAt })),
  });
}

// ── Users ─────────────────────────────────────────────────────────────────────

async function listAdminUsers(req, res) {
  res.json(await listUsers());
}

async function updateAdminUser(req, res) {
  const { name, email } = req.body;
  const user = await findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(await updateUser(req.params.id, { name, email }));
}

async function changeAdminUserRole(req, res) {
  const { role } = req.body;
  const user = await findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(await updateRole(req.params.id, role));
}

async function deleteAdminUser(req, res) {
  const user = await findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  await deleteUserById(req.params.id);
  res.status(204).end();
}

// ── Courses ───────────────────────────────────────────────────────────────────

async function listAdminCourses(req, res) {
  res.json(await listCourses());
}

async function getAdminCourse(req, res) {
  const course = await findCourseById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
  res.json(course);
}

async function getAdminCourseStats(req, res) {
  const course = await findCourseById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
  const stats = await getCourseStats(req.params.id);
  res.json(stats);
}

async function getAdminCourseStudents(req, res) {
  const course = await findCourseById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const result = await getStudentsProgress(req.params.id, page, limit);
  res.json(result);
}

async function createAdminCourse(req, res) {
  const { title, description } = req.body;
  const course = await createCourse({ title, description, createdBy: null });
  res.status(201).json(course);
}

async function updateAdminCourse(req, res) {
  const course = await findCourseById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
  const { title, description } = req.body;
  res.json(await updateCourse(req.params.id, { title, description }));
}

async function deleteAdminCourse(req, res) {
  const course = await findCourseById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Curso no encontrado' });
  await deleteCourse(req.params.id);
  res.status(204).end();
}

// ── Lessons ───────────────────────────────────────────────────────────────────

async function listAdminLessons(req, res) {
  res.json(await listLessonsByCourse(req.params.courseId));
}

async function createAdminLesson(req, res) {
  const { title, content, orderNumber } = req.body;
  const lesson = await createLesson({
    courseId: req.params.courseId,
    title,
    content,
    orderNumber,
  });
  res.status(201).json(lesson);
}

async function updateAdminLesson(req, res) {
  const lesson = await findLessonById(req.params.id);
  if (!lesson) return res.status(404).json({ message: 'Lección no encontrada' });
  const { title, content, orderNumber } = req.body;
  res.json(await updateLesson(req.params.id, {
    title,
    content,
    orderNumber: orderNumber ?? lesson.order_number,
  }));
}

async function deleteAdminLesson(req, res) {
  const lesson = await findLessonById(req.params.id);
  if (!lesson) return res.status(404).json({ message: 'Lección no encontrada' });
  await deleteLesson(req.params.id);
  res.status(204).end();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

async function listAdminTests(req, res) {
  if (req.params.courseId) {
    return res.json(await listTestsByCourse(req.params.courseId));
  }
  const tests = await prisma.test.findMany({
    orderBy: { id: 'desc' },
    include: { course: { select: { title: true } } },
  });
  res.json(tests.map(t => ({
    id: t.id,
    course_id: t.courseId,
    title: t.title,
    description: t.description,
    max_score: Number(t.maxScore),
    course_title: t.course.title,
  })));
}

async function createAdminTest(req, res) {
  const { title, description, maxScore } = req.body;
  const test = await createTest({ courseId: req.params.courseId, title, description, maxScore });
  res.status(201).json(test);
}

async function updateAdminTest(req, res) {
  const test = await findTestById(req.params.id);
  if (!test) return res.status(404).json({ message: 'Test no encontrado' });
  const { title, description, maxScore } = req.body;
  res.json(await updateTest(req.params.id, { title, description, maxScore }));
}

async function deleteAdminTest(req, res) {
  const test = await findTestById(req.params.id);
  if (!test) return res.status(404).json({ message: 'Test no encontrado' });
  await deleteTest(req.params.id);
  res.status(204).end();
}

// ── Questions ─────────────────────────────────────────────────────────────────

async function listAdminQuestions(req, res) {
  res.json(await listQuestionsWithPoints(req.params.testId));
}

async function createAdminQuestion(req, res) {
  const { question, optionA, optionB, optionC, correctOption, points } = req.body;
  const pointsError = await validateCustomPoints(req.params.testId, points ?? null);
  if (pointsError) return res.status(400).json({ message: pointsError });
  const q = await createQuestion({
    testId: req.params.testId,
    question,
    optionA,
    optionB,
    optionC,
    correctOption,
    points,
  });
  res.status(201).json(q);
}

async function updateAdminQuestion(req, res) {
  const q = await findQuestionById(req.params.id);
  if (!q) return res.status(404).json({ message: 'Pregunta no encontrada' });
  const { question, optionA, optionB, optionC, correctOption, points } = req.body;
  const pointsError = await validateCustomPoints(q.test_id, points ?? null, Number(req.params.id));
  if (pointsError) return res.status(400).json({ message: pointsError });
  res.json(await updateQuestion(req.params.id, { question, optionA, optionB, optionC, correctOption, points }));
}

async function deleteAdminQuestion(req, res) {
  const q = await findQuestionById(req.params.id);
  if (!q) return res.status(404).json({ message: 'Pregunta no encontrada' });
  await deleteQuestion(req.params.id);
  res.status(204).end();
}

export default wrapController({
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
});
