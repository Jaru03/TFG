import prisma from '../config/prisma.js';

async function markLessonComplete(userId, lessonId) {
  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: Number(userId), lessonId: Number(lessonId) } },
    create: { userId: Number(userId), lessonId: Number(lessonId) },
    update: {},
  });
}

async function unmarkLessonComplete(userId, lessonId) {
  await prisma.lessonProgress.deleteMany({
    where: { userId: Number(userId), lessonId: Number(lessonId) },
  });
}

async function listCompletedLessonIds(userId, courseId) {
  const progress = await prisma.lessonProgress.findMany({
    where: {
      userId: Number(userId),
      lesson: { courseId: Number(courseId) },
    },
    select: { lessonId: true },
  });
  return progress.map(p => p.lessonId);
}

export { markLessonComplete, unmarkLessonComplete, listCompletedLessonIds };
