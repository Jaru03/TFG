const { query } = require('../config/db');

async function listCourses() {
  return query(
    `SELECT c.*, u.name AS instructor
     FROM courses c
     LEFT JOIN users u ON c.created_by = u.id
     ORDER BY c.created_at DESC`
  );
}

async function findCourseById(id) {
  const rows = await query(
    `SELECT c.*, u.name AS instructor
     FROM courses c
     LEFT JOIN users u ON c.created_by = u.id
     WHERE c.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function createCourse({ title, description, createdBy }) {
  const rows = await query(
    'INSERT INTO courses (title, description, created_by) VALUES ($1, $2, $3) RETURNING id',
    [title, description, createdBy]
  );
  return findCourseById(rows[0].id);
}

async function updateCourse(id, { title, description }) {
  await query('UPDATE courses SET title = $1, description = $2 WHERE id = $3', [title, description, id]);
  return findCourseById(id);
}

async function deleteCourse(id) {
  await query('DELETE FROM courses WHERE id = $1', [id]);
}

async function getTeacherStats(teacherId) {
  const courses = await query(
    `SELECT c.id FROM courses c WHERE c.created_by = $1`,
    [teacherId]
  );

  const courseIds = courses.map(c => c.id);

  if (courseIds.length === 0) {
    return { courses: 0, students: 0, testsCompleted: 0 };
  }

  const placeholders = courseIds.map((_, i) => `$${i + 1}`).join(', ');

  const enrollmentResult = await query(
    `SELECT COUNT(DISTINCT uc.user_id) as count
     FROM user_courses uc
     WHERE uc.course_id IN (${placeholders})`,
    courseIds
  );

  const resultsResult = await query(
    `SELECT COUNT(*) as count
     FROM results r
     JOIN tests t ON r.test_id = t.id
     WHERE t.course_id IN (${placeholders})`,
    courseIds
  );

  return {
    courses: courseIds.length,
    students: parseInt(enrollmentResult[0]?.count) || 0,
    testsCompleted: parseInt(resultsResult[0]?.count) || 0
  };
}

async function getCourseStats(courseId) {
  const enrollmentResult = await query(
    `SELECT COUNT(*) as count FROM user_courses WHERE course_id = $1`,
    [courseId]
  );

  const lessonsResult = await query(
    `SELECT COUNT(*) as count FROM lessons WHERE course_id = $1`,
    [courseId]
  );

  const testsResult = await query(
    `SELECT COUNT(*) as count FROM tests WHERE course_id = $1`,
    [courseId]
  );

  const completedResult = await query(
    `SELECT COUNT(*) as count
     FROM results r
     JOIN tests t ON r.test_id = t.id
     WHERE t.course_id = $1`,
    [courseId]
  );

  return {
    students: parseInt(enrollmentResult[0]?.count) || 0,
    lessons: parseInt(lessonsResult[0]?.count) || 0,
    tests: parseInt(testsResult[0]?.count) || 0,
    completedTests: parseInt(completedResult[0]?.count) || 0
  };
}

async function enrollUser(userId, courseId) {
  await query(
    'INSERT INTO user_courses (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [userId, courseId]
  );
}

async function isEnrolled(userId, courseId) {
  const rows = await query(
    'SELECT 1 FROM user_courses WHERE user_id = $1 AND course_id = $2',
    [userId, courseId]
  );
  return rows.length > 0;
}

module.exports = {
  listCourses,
  findCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getTeacherStats,
  getCourseStats,
  enrollUser,
  isEnrolled
};
