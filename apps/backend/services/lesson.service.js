import prisma from '../config/prisma.js';

function toLesson(p) {
  if (!p) return null;
  return {
    id: p.id,
    course_id: p.courseId,
    title: p.title,
    content: p.content,
    order_number: p.orderNumber,
  };
}

async function listLessonsByCourse(courseId) {
  const lessons = await prisma.lesson.findMany({
    where: { courseId: Number(courseId) },
    orderBy: { orderNumber: 'asc' },
  });
  return lessons.map(toLesson);
}

async function findLessonById(id) {
  return toLesson(await prisma.lesson.findUnique({ where: { id: Number(id) } }));
}

async function createLesson({ courseId, title, content, orderNumber = 1 }) {
  return toLesson(await prisma.lesson.create({
    data: { courseId: Number(courseId), title, content, orderNumber: Number(orderNumber) },
  }));
}

async function updateLesson(id, { title, content, orderNumber }) {
  return toLesson(await prisma.lesson.update({
    where: { id: Number(id) },
    data: { title, content, orderNumber: Number(orderNumber) },
  }));
}

async function deleteLesson(id) {
  await prisma.lesson.delete({ where: { id: Number(id) } });
}

export { listLessonsByCourse, findLessonById, createLesson, updateLesson, deleteLesson };
