const { query } = require('../config/db');

async function listQuestionsByTest(testId) {
  return query('SELECT * FROM questions WHERE test_id = $1', [testId]);
}

async function findQuestionById(id) {
  const rows = await query('SELECT * FROM questions WHERE id = $1', [id]);
  return rows[0] || null;
}

async function createQuestion({ testId, question, optionA, optionB, optionC, correctOption }) {
  const rows = await query(
    'INSERT INTO questions (test_id, question, option_a, option_b, option_c, correct_option) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [testId, question, optionA, optionB, optionC, correctOption]
  );
  return findQuestionById(rows[0].id);
}

async function updateQuestion(id, { question, optionA, optionB, optionC, correctOption }) {
  await query(
    'UPDATE questions SET question = $1, option_a = $2, option_b = $3, option_c = $4, correct_option = $5 WHERE id = $6',
    [question, optionA, optionB, optionC, correctOption, id]
  );
  return findQuestionById(id);
}

async function deleteQuestion(id) {
  await query('DELETE FROM questions WHERE id = $1', [id]);
}

module.exports = {
  listQuestionsByTest,
  findQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
