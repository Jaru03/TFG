import { wrapController } from '../../middleware/errorHandler.js';
import {
  listQuestionsWithPoints,
  validateCustomPoints,
  findQuestionById,
  createQuestion as createQuestionService,
  updateQuestion as updateQuestionService,
  deleteQuestion as deleteQuestionService
} from '../../services/question.service.js';

async function listQuestions(req, res) {
  const { testId } = req.params;
  const questions = await listQuestionsWithPoints(testId);

  // El alumno hace el test desde este endpoint: NO debe recibir la respuesta
  // correcta (sería visible en las DevTools). La corrección se hace en el
  // servidor (submitTest). Profesores y administradores sí la ven, porque la
  // necesitan para gestionar las preguntas. Los puntos sí se envían a todos.
  const isStaff = req.user.role === 'profesor' || req.user.role === 'administrador';
  const payload = isStaff
    ? questions
    : questions.map(({ correct_option, ...rest }) => rest);

  res.json(payload);
}

async function createQuestion(req, res) {
  const { testId } = req.params;
  const { question, optionA, optionB, optionC, correctOption, points } = req.body;

  // Regla de negocio (necesita la BD): los puntos custom no superan el valor del test.
  const pointsError = await validateCustomPoints(testId, points ?? null);
  if (pointsError) return res.status(400).json({ message: pointsError });

  const created = await createQuestionService({
    testId,
    question,
    optionA,
    optionB,
    optionC,
    correctOption,
    points
  });

  res.status(201).json(created);
}

async function updateQuestion(req, res) {
  const { id } = req.params;
  const { question, optionA, optionB, optionC, correctOption, points } = req.body;

  const existing = await findQuestionById(id);
  if (!existing) return res.status(404).json({ message: 'Pregunta no encontrada' });

  const pointsError = await validateCustomPoints(existing.test_id, points ?? null, Number(id));
  if (pointsError) return res.status(400).json({ message: pointsError });

  const updated = await updateQuestionService(id, {
    question,
    optionA,
    optionB,
    optionC,
    correctOption,
    points
  });

  res.json(updated);
}

async function deleteQuestion(req, res) {
  await deleteQuestionService(req.params.id);
  res.status(204).end();
}

export default wrapController({
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
});
