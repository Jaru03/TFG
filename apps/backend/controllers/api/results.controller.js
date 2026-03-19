const { findTestById } = require('../../services/test.service');
const { listQuestionsByTest } = require('../../services/question.service');
const { createResult, listResultsByUser, listResultsByTest } = require('../../services/result.service');

async function submitTest(req, res) {
  const { id: testId } = req.params;
  const answers = req.body.answers;

  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: 'Se requieren respuestas en formato array.' });
  }

  const test = await findTestById(testId);
  if (!test) {
    return res.status(404).json({ message: 'Test no encontrado.' });
  }

  const questions = await listQuestionsByTest(testId);
  const questionMap = new Map(questions.map(q => [q.id, q]));

  let score = 0;
  answers.forEach(ans => {
    const question = questionMap.get(ans.questionId);
    if (!question) return;
    if (String(ans.answer).trim().toUpperCase() === String(question.correct_option).trim().toUpperCase()) {
      score += 1;
    }
  });

  await createResult({ userId: req.user.id, testId, score });

  res.json({ score, total: questions.length });
}

async function listMyResults(req, res) {
  const results = await listResultsByUser(req.user.id);
  res.json(results);
}

async function getResultsByTest(req, res) {
  const { id: testId } = req.params;
  const results = await listResultsByTest(testId);
  res.json(results);
}

module.exports = {
  submitTest,
  listMyResults,
  getResultsByTest
};
