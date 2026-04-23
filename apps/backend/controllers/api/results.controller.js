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
  const details = answers.map(ans => {
    const question = questionMap.get(ans.questionId);
    if (!question) return null;
    const correct =
      String(ans.answer).trim().toUpperCase() ===
      String(question.correct_option).trim().toUpperCase();
    if (correct) score += 1;
    return {
      questionId: question.id,
      question:   question.question,
      optionA:    question.option_a,
      optionB:    question.option_b,
      optionC:    question.option_c,
      correctOption: question.correct_option,
      yourAnswer: ans.answer || null,
      correct,
    };
  }).filter(Boolean);

  await createResult({ userId: req.user.id, testId, score });

  res.json({ score, total: questions.length, details });
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
