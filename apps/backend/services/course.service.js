import prisma from '../config/prisma.js';

function toCourse(p) {
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    cover_image: p.coverImage,
    created_by: p.createdBy,
    created_at: p.createdAt,
    instructor: p.creator?.name ?? null,
  };
}

async function listCourses() {
  const courses = await prisma.course.findMany({
    include: { creator: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return courses.map(toCourse);
}

async function findCourseById(id) {
  return toCourse(await prisma.course.findUnique({
    where: { id: Number(id) },
    include: { creator: { select: { name: true } } },
  }));
}

async function createCourse({ title, description, createdBy, coverImage }) {
  return toCourse(await prisma.course.create({
    data: {
      title,
      description,
      coverImage: coverImage || null,
      ...(createdBy ? { createdBy: Number(createdBy) } : {}),
    },
    include: { creator: { select: { name: true } } },
  }));
}

async function updateCourse(id, { title, description, coverImage }) {
  const data = { title, description };
  if (coverImage !== undefined) data.coverImage = coverImage;
  return toCourse(await prisma.course.update({
    where: { id: Number(id) },
    data,
    include: { creator: { select: { name: true } } },
  }));
}

async function deleteCourse(id) {
  await prisma.course.delete({ where: { id: Number(id) } });
}

async function getTeacherStats(teacherId) {
  const courses = await prisma.course.findMany({
    where: { createdBy: Number(teacherId) },
    select: { id: true },
  });

  if (courses.length === 0) return { courses: 0, students: 0, testsCompleted: 0 };

  const courseIds = courses.map(c => c.id);

  // groupBy(['userId']) devuelve una entrada por alumno distinto inscrito.
  // groupBy(['userId', 'testId']) devuelve una entrada por intento único (alumno + test).
  const [studentsGroups, completedGroups] = await Promise.all([
    prisma.userCourse.groupBy({
      by: ['userId'],
      where: { courseId: { in: courseIds } },
    }),
    prisma.result.groupBy({
      by: ['userId', 'testId'],
      where: { test: { courseId: { in: courseIds } } },
    }),
  ]);

  return {
    courses: courseIds.length,
    students: studentsGroups.length,
    testsCompleted: completedGroups.length,
  };
}

async function getCourseStats(courseId) {
  const cId = Number(courseId);

  const [students, lessons, tests, completedGroups, enrollments] = await Promise.all([
    prisma.userCourse.count({ where: { courseId: cId } }),
    prisma.lesson.count({ where: { courseId: cId } }),
    prisma.test.count({ where: { courseId: cId } }),
    prisma.result.groupBy({
      by: ['userId', 'testId'],
      where: { test: { courseId: cId } },
    }),
    prisma.userCourse.findMany({
      where: { courseId: cId },
      select: { userId: true },
    }),
  ]);

  const total = lessons + tests;
  let avgProgress = 0;

  if (students > 0 && total > 0) {
    const userIds = enrollments.map(e => e.userId);

    const [completedLessons, completedTests] = await Promise.all([
      prisma.lessonProgress.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds }, lesson: { courseId: cId } },
        _count: { lessonId: true },
      }),
      prisma.result.groupBy({
        by: ['userId', 'testId'],
        where: { userId: { in: userIds }, test: { courseId: cId } },
      }),
    ]);

    const lessonsMap = new Map(completedLessons.map(r => [r.userId, r._count.lessonId]));
    const testsMap = new Map();
    for (const r of completedTests) {
      testsMap.set(r.userId, (testsMap.get(r.userId) ?? 0) + 1);
    }

    const totalRatio = userIds.reduce((sum, uid) => {
      return sum + ((lessonsMap.get(uid) ?? 0) + (testsMap.get(uid) ?? 0)) / total;
    }, 0);

    avgProgress = Math.round((totalRatio / students) * 100);
  }

  return { students, lessons, tests, completedTests: completedGroups.length, avgProgress };
}

async function getStudentsProgress(courseId, page = 1, limit = 10) {
  const cId = Number(courseId);
  const offset = (page - 1) * limit;

  const [total, totalLessons, totalTests] = await Promise.all([
    prisma.userCourse.count({ where: { courseId: cId } }),
    prisma.lesson.count({ where: { courseId: cId } }),
    prisma.test.count({ where: { courseId: cId } }),
  ]);

  const enrolled = await prisma.userCourse.findMany({
    where: { courseId: cId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { user: { name: 'asc' } },
    skip: offset,
    take: limit,
  });

  if (enrolled.length === 0) return { students: [], total, page, limit };

  const userIds = enrolled.map(e => e.userId);

  const [completedLessonsGroups, completedTestGroups, allResults] = await Promise.all([
    prisma.lessonProgress.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, lesson: { courseId: cId } },
      _count: { lessonId: true },
    }),
    prisma.result.groupBy({
      by: ['userId', 'testId'],
      where: { userId: { in: userIds }, test: { courseId: cId } },
    }),
    prisma.result.findMany({
      where: { userId: { in: userIds }, test: { courseId: cId } },
      select: { userId: true, testId: true, score: true },
    }),
  ]);

  const lessonsMap = new Map(completedLessonsGroups.map(r => [r.userId, r._count.lessonId]));

  const completedTestsMap = new Map();
  for (const r of completedTestGroups) {
    completedTestsMap.set(r.userId, (completedTestsMap.get(r.userId) ?? 0) + 1);
  }

  // Para el avg_score: por cada (userId, testId) tomar el mejor intento,
  // luego promediar esos mejores intentos por usuario.
  const bestPerAttempt = new Map();
  for (const r of allResults) {
    const key = `${r.userId}:${r.testId}`;
    const prev = bestPerAttempt.get(key);
    if (!prev || Number(r.score) > prev.score) {
      bestPerAttempt.set(key, { userId: r.userId, score: Number(r.score) });
    }
  }
  const userAvgMap = new Map();
  for (const { userId, score } of bestPerAttempt.values()) {
    const entry = userAvgMap.get(userId) ?? { sum: 0, count: 0 };
    entry.sum += score;
    entry.count += 1;
    userAvgMap.set(userId, entry);
  }

  const students = enrolled.map(({ user }) => {
    const avgEntry = userAvgMap.get(user.id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      total_lessons: totalLessons,
      completed_lessons: lessonsMap.get(user.id) ?? 0,
      total_tests: totalTests,
      completed_tests: completedTestsMap.get(user.id) ?? 0,
      avg_score: avgEntry ? Math.round(avgEntry.sum / avgEntry.count * 100) / 100 : null,
    };
  });

  return { students, total, page, limit };
}

async function getEnrolledCourses(userId) {
  const uId = Number(userId);

  const enrollments = await prisma.userCourse.findMany({
    where: { userId: uId },
    include: { course: { include: { creator: { select: { name: true } } } } },
    orderBy: { enrolledAt: 'desc' },
  });

  if (enrollments.length === 0) return [];

  const courseIds = enrollments.map(e => e.courseId);

  const [lessonCounts, testCounts, completedLessonsData, completedTestGroups] = await Promise.all([
    prisma.lesson.groupBy({
      by: ['courseId'],
      where: { courseId: { in: courseIds } },
      _count: { id: true },
    }),
    prisma.test.groupBy({
      by: ['courseId'],
      where: { courseId: { in: courseIds } },
      _count: { id: true },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: uId, lesson: { courseId: { in: courseIds } } },
      include: { lesson: { select: { courseId: true } } },
    }),
    prisma.result.groupBy({
      by: ['testId'],
      where: { userId: uId, test: { courseId: { in: courseIds } } },
    }),
  ]);

  const lessonCountMap = new Map(lessonCounts.map(r => [r.courseId, r._count.id]));
  const testCountMap = new Map(testCounts.map(r => [r.courseId, r._count.id]));

  const completedLessonsMap = new Map();
  for (const lp of completedLessonsData) {
    const cId = lp.lesson.courseId;
    completedLessonsMap.set(cId, (completedLessonsMap.get(cId) ?? 0) + 1);
  }

  // Mapear testId → courseId para saber a qué curso pertenece cada test completado.
  const completedTestIds = completedTestGroups.map(r => r.testId);
  const testsWithCourse = completedTestIds.length > 0
    ? await prisma.test.findMany({
        where: { id: { in: completedTestIds } },
        select: { id: true, courseId: true },
      })
    : [];
  const testCourseMap = new Map(testsWithCourse.map(t => [t.id, t.courseId]));

  const completedTestsMap = new Map();
  for (const r of completedTestGroups) {
    const cId = testCourseMap.get(r.testId);
    if (cId) completedTestsMap.set(cId, (completedTestsMap.get(cId) ?? 0) + 1);
  }

  return enrollments.map(({ course }) => ({
    ...toCourse(course),
    total_lessons: lessonCountMap.get(course.id) ?? 0,
    completed_lessons: completedLessonsMap.get(course.id) ?? 0,
    total_tests: testCountMap.get(course.id) ?? 0,
    completed_tests: completedTestsMap.get(course.id) ?? 0,
  }));
}

async function enrollUser(userId, courseId) {
  await prisma.userCourse.upsert({
    where: { userId_courseId: { userId: Number(userId), courseId: Number(courseId) } },
    create: { userId: Number(userId), courseId: Number(courseId) },
    update: {},
  });
}

async function isEnrolled(userId, courseId) {
  const count = await prisma.userCourse.count({
    where: { userId: Number(userId), courseId: Number(courseId) },
  });
  return count > 0;
}

export {
  listCourses,
  findCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getTeacherStats,
  getCourseStats,
  getStudentsProgress,
  getEnrolledCourses,
  enrollUser,
  isEnrolled,
};
