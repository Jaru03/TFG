const { query } = require('../config/db');

async function listTestsByCourse(courseId) {
  return query('SELECT * FROM tests WHERE course_id = $1', [courseId]);
}

async function findTestById(id) {
  const rows = await query('SELECT * FROM tests WHERE id = $1', [id]);
  return rows[0] || null;
}

async function createTest({ courseId, title, description }) {
  const rows = await query(
    'INSERT INTO tests (course_id, title, description) VALUES ($1, $2, $3) RETURNING id',
    [courseId, title, description]
  );
  return findTestById(rows[0].id);
}

async function updateTest(id, { title, description }) {
  await query('UPDATE tests SET title = $1, description = $2 WHERE id = $3', [title, description, id]);
  return findTestById(id);
}

async function deleteTest(id) {
  await query('DELETE FROM tests WHERE id = $1', [id]);
}

module.exports = {
  listTestsByCourse,
  findTestById,
  createTest,
  updateTest,
  deleteTest
};
