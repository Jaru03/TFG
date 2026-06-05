import prisma from '../config/prisma.js';
import { computeEffectivePoints } from '../utils/questionPoints.js';

function toQuestion(p) {
  if (!p) return null;
  return {
    id: p.id,
    test_id: p.testId,
    question: p.question,
    option_a: p.optionA,
    option_b: p.optionB,
    option_c: p.optionC,
    correct_option: p.correctOption,
    points: p.points != null ? Number(p.points) : null,
  };
}

async function listQuestionsByTest(testId) {
  const questions = await prisma.question.findMany({
    where: { testId: Number(testId) },
    orderBy: { id: 'asc' },
  });
  return questions.map(toQuestion);
}

async function listQuestionsWithPoints(testId) {
  const test = await prisma.test.findUnique({ where: { id: Number(testId) } });
  const maxScore = test?.maxScore ? Number(test.maxScore) : 10;
  const questions = await listQuestionsByTest(testId);
  const pointsMap = computeEffectivePoints(questions, maxScore);
  return questions.map(q => ({ ...q, effective_points: pointsMap.get(q.id) }));
}

async function sumCustomPoints(testId, excludeId = null) {
  const where = { testId: Number(testId), points: { not: null } };
  if (excludeId != null) where.id = { not: Number(excludeId) };

  const questions = await prisma.question.findMany({ where, select: { points: true } });
  return questions.reduce((sum, q) => sum + Number(q.points), 0);
}

async function validateCustomPoints(testId, points, excludeId = null) {
  if (points == null) return null;
  if (!Number.isFinite(points) || points < 0) {
    return 'Los puntos de la pregunta deben ser un número mayor o igual que 0.';
  }
  const test = await prisma.test.findUnique({ where: { id: Number(testId) } });
  const max = Number(test?.maxScore ?? 10);
  const otherCustom = await sumCustomPoints(testId, excludeId);
  if (otherCustom + points > max + 1e-9) {
    return `Los puntos custom sumarían ${otherCustom + points}, superando el valor del test (${max}).`;
  }
  return null;
}

async function findQuestionById(id) {
  return toQuestion(await prisma.question.findUnique({ where: { id: Number(id) } }));
}

async function createQuestion({ testId, question, optionA, optionB, optionC, correctOption, points = null }) {
  return toQuestion(await prisma.question.create({
    data: {
      testId: Number(testId),
      question,
      optionA,
      optionB,
      optionC,
      correctOption,
      points: points != null ? Number(points) : null,
    },
  }));
}

async function updateQuestion(id, { question, optionA, optionB, optionC, correctOption, points = null }) {
  return toQuestion(await prisma.question.update({
    where: { id: Number(id) },
    data: {
      question,
      optionA,
      optionB,
      optionC,
      correctOption,
      points: points != null ? Number(points) : null,
    },
  }));
}

async function deleteQuestion(id) {
  await prisma.question.delete({ where: { id: Number(id) } });
}

export {
  listQuestionsByTest,
  listQuestionsWithPoints,
  sumCustomPoints,
  validateCustomPoints,
  findQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
