const { query } = require('../config/db');

async function listLessonsByCourse(courseId) {
  return query(
    'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_number ASC',
    [courseId]
  );
}

async function findLessonById(id) {
  const rows = await query('SELECT * FROM lessons WHERE id = $1', [id]);
  return rows[0] || null;
}

async function createLesson({ courseId, title, content, orderNumber = 1 }) {
  const rows = await query(
    'INSERT INTO lessons (course_id, title, content, order_number) VALUES ($1, $2, $3, $4) RETURNING id',
    [courseId, title, content, orderNumber]
  );
  return findLessonById(rows[0].id);
}

async function updateLesson(id, { title, content, orderNumber }) {
  await query(
    'UPDATE lessons SET title = $1, content = $2, order_number = $3 WHERE id = $4',
    [title, content, orderNumber, id]
  );
  return findLessonById(id);
}

async function deleteLesson(id) {
  await query('DELETE FROM lessons WHERE id = $1', [id]);
}

module.exports = {
  listLessonsByCourse,
  findLessonById,
  createLesson,
  updateLesson,
  deleteLesson
};
