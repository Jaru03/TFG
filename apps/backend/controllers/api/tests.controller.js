import { wrapController } from '../../middleware/errorHandler.js';
import {
  listTestsByCourse,
  findTestById,
  createTest as createTestService,
  updateTest as updateTestService,
  deleteTest as deleteTestService
} from '../../services/test.service.js';

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
  const { title, description, maxScore } = req.body;

  const test = await createTestService({ courseId, title, description, maxScore });

  res.status(201).json(test);
}

async function updateTest(req, res) {
  const test = await findTestById(req.params.id);
  if (!test) {
    return res.status(404).json({ message: 'Test no encontrado' });
  }

  const { title, description, maxScore } = req.body;
  const updated = await updateTestService(req.params.id, {
    title,
    description,
    maxScore // undefined => el servicio conserva el valor actual
  });

  res.json(updated);
}

async function deleteTest(req, res) {
  await deleteTestService(req.params.id);
  res.status(204).end();
}

export default wrapController({
  listTests,
  getTest,
  createTest,
  updateTest,
  deleteTest
});
