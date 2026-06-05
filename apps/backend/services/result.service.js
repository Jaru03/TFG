import prisma from '../config/prisma.js';

function toResult(p) {
  if (!p) return null;
  return {
    id: p.id,
    user_id: p.userId,
    test_id: p.testId,
    score: Number(p.score),
    completed_at: p.completedAt,
    ...(p.test ? { test_title: p.test.title, course_title: p.test.course?.title ?? null } : {}),
    ...(p.user ? { user_name: p.user.name, email: p.user.email } : {}),
  };
}

async function createResult({ userId, testId, score }) {
  const result = await prisma.result.create({
    data: { userId: Number(userId), testId: Number(testId), score: Number(score) },
  });
  return { id: result.id };
}

async function countAttempts(userId, testId) {
  return prisma.result.count({
    where: { userId: Number(userId), testId: Number(testId) },
  });
}

async function listResultsByUser(userId) {
  const results = await prisma.result.findMany({
    where: { userId: Number(userId) },
    include: { test: { include: { course: { select: { title: true } } } } },
    orderBy: { completedAt: 'desc' },
  });
  return results.map(toResult);
}

async function listResultsByTest(testId) {
  const results = await prisma.result.findMany({
    where: { testId: Number(testId) },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { completedAt: 'desc' },
  });
  return results.map(toResult);
}

export { createResult, countAttempts, listResultsByUser, listResultsByTest };
