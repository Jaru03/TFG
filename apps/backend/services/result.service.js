const { query } = require('../config/db');

async function createResult({ userId, testId, score }) {
  const rows = await query(
    'INSERT INTO results (user_id, test_id, score) VALUES ($1, $2, $3) RETURNING id',
    [userId, testId, score]
  );
  return rows[0];
}

async function listResultsByUser(userId) {
  return query(
    `SELECT r.*, t.title AS test_title, c.title AS course_title
     FROM results r
     JOIN tests t ON r.test_id = t.id
     JOIN courses c ON t.course_id = c.id
     WHERE r.user_id = $1
     ORDER BY r.completed_at DESC`,
    [userId]
  );
}

async function listResultsByTest(testId) {
  return query(
    `SELECT r.*, u.name AS user_name, u.email
     FROM results r
     JOIN users u ON r.user_id = u.id
     WHERE r.test_id = $1
     ORDER BY r.completed_at DESC`,
    [testId]
  );
}

module.exports = {
  createResult,
  listResultsByUser,
  listResultsByTest
};
