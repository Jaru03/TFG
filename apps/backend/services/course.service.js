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

module.exports = {
  listCourses,
  findCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
