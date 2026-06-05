import prisma from '../config/prisma.js';

function toTest(p, extra = {}) {
  if (!p) return null;
  return {
    id: p.id,
    course_id: p.courseId,
    title: p.title,
    description: p.description,
    max_score: Number(p.maxScore),
    ...extra,
  };
}

async function listTestsByCourse(courseId) {
  const tests = await prisma.test.findMany({
    where: { courseId: Number(courseId) },
  });
  return tests.map(t => toTest(t));
}

async function findTestById(id) {
  return toTest(await prisma.test.findUnique({ where: { id: Number(id) } }));
}

async function createTest({ courseId, title, description, maxScore = 10 }) {
  return toTest(await prisma.test.create({
    data: { courseId: Number(courseId), title, description, maxScore: Number(maxScore) },
  }));
}

async function updateTest(id, { title, description, maxScore }) {
  const data = { title, description };
  if (maxScore != null) data.maxScore = Number(maxScore);
  return toTest(await prisma.test.update({
    where: { id: Number(id) },
    data,
  }));
}

async function deleteTest(id) {
  await prisma.test.delete({ where: { id: Number(id) } });
}

export { listTestsByCourse, findTestById, createTest, updateTest, deleteTest };
