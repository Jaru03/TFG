import { wrapController } from '../../middleware/errorHandler.js';
import { findTestById } from '../../services/test.service.js';
import { listQuestionsByTest } from '../../services/question.service.js';
import { createResult, countAttempts, listResultsByUser, listResultsByTest } from '../../services/result.service.js';
import { computeEffectivePoints, round2 } from '../../utils/questionPoints.js';

// Número máximo de intentos que un alumno puede hacer de un mismo test.
const MAX_ATTEMPTS = 3;

async function getAttempts(req, res) {
  const { id: testId } = req.params;
  const test = await findTestById(testId);
  if (!test) {
    return res.status(404).json({ message: 'Test no encontrado.' });
  }
  const used = await countAttempts(req.user.id, testId);
  res.json({ used, max: MAX_ATTEMPTS, remaining: Math.max(MAX_ATTEMPTS - used, 0) });
}

async function submitTest(req, res) {
  const { id: testId } = req.params;
  const { answers } = req.body;

  const test = await findTestById(testId);
  if (!test) {
    return res.status(404).json({ message: 'Test no encontrado.' });
  }

  // Tope de intentos: el alumno no puede pasar de MAX_ATTEMPTS.
  const used = await countAttempts(req.user.id, testId);
  if (used >= MAX_ATTEMPTS) {
    return res.status(403).json({ message: `Has agotado tus ${MAX_ATTEMPTS} intentos para este test.` });
  }

  const questions = await listQuestionsByTest(testId);
  const questionMap = new Map(questions.map(q => [q.id, q]));

  // Puntos efectivos de cada pregunta (custom o reparto automático).
  const pointsMap = computeEffectivePoints(questions, test.max_score);

  let correctCount = 0;
  let rawScore = 0;
  const details = answers.map(ans => {
    const question = questionMap.get(ans.questionId);
    if (!question) return null;
    const correct =
      String(ans.answer).trim().toUpperCase() ===
      String(question.correct_option).trim().toUpperCase();
    const points = pointsMap.get(question.id) || 0;
    if (correct) { correctCount += 1; rawScore += points; }
    return {
      questionId: question.id,
      question:   question.question,
      optionA:    question.option_a,
      optionB:    question.option_b,
      optionC:    question.option_c,
      correctOption: question.correct_option,
      yourAnswer: ans.answer || null,
      points,
      correct,
    };
  }).filter(Boolean);

  // La nota es la suma de los puntos de las preguntas acertadas.
  const total = questions.length;
  const score = round2(rawScore);
  const max = Number(test.max_score);

  await createResult({ userId: req.user.id, testId, score });
  const remaining = Math.max(MAX_ATTEMPTS - (used + 1), 0);

  res.json({ score, max, correct: correctCount, total, details, attemptsRemaining: remaining, maxAttempts: MAX_ATTEMPTS });
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

export default wrapController({
  submitTest,
  getAttempts,
  listMyResults,
  getResultsByTest
});
