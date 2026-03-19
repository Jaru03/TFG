const {
  listTestsByCourse,
  findTestById,
  createTest: createTestService,
  updateTest: updateTestService,
  deleteTest: deleteTestService
} = require('../../services/test.service');

async function listTests(req, res) {
  const { courseId } = req.params;
  const tests = await listTestsByCourse(courseId);
  res.json(tests);
}

async function getTest(req, res) {
  const test = await findTestById(req.params.id);
  if (!test) {
    return res.status(404).json({ message: 'Test no encontrado' });
  }
  res.json(test);
}

async function createTest(req, res) {
  const { courseId } = req.params;
  const { title, description } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'El título es obligatorio.' });
  }

  const test = await createTestService({
    courseId,
    title: title.trim(),
    description: description ? description.trim() : ''
  });

  res.status(201).json(test);
}

async function updateTest(req, res) {
  const test = await findTestById(req.params.id);
  if (!test) {
    return res.status(404).json({ message: 'Test no encontrado' });
  }

  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'El título es obligatorio.' });
  }

  const updated = await updateTestService(req.params.id, {
    title: title.trim(),
    description: description ? description.trim() : ''
  });

  res.json(updated);
}

async function deleteTest(req, res) {
  await deleteTestService(req.params.id);
  res.status(204).end();
}

module.exports = {
  listTests,
  getTest,
  createTest,
  updateTest,
  deleteTest
};
