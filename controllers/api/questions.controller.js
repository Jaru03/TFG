const {
  listQuestionsByTest,
  createQuestion: createQuestionService,
  updateQuestion: updateQuestionService,
  deleteQuestion: deleteQuestionService
} = require('../../services/question.service');

async function listQuestions(req, res) {
  const { testId } = req.params;
  const questions = await listQuestionsByTest(testId);
  res.json(questions);
}

async function createQuestion(req, res) {
  const { testId } = req.params;
  const { question, optionA, optionB, optionC, correctOption } = req.body;

  if (!question || !question.trim() || !correctOption) {
    return res.status(400).json({ message: 'Pregunta y respuesta correcta son obligatorias.' });
  }

  const created = await createQuestionService({
    testId,
    question: question.trim(),
    optionA: optionA || '',
    optionB: optionB || '',
    optionC: optionC || '',
    correctOption
  });

  res.status(201).json(created);
}

async function updateQuestion(req, res) {
  const { id } = req.params;
  const { question, optionA, optionB, optionC, correctOption } = req.body;

  if (!question || !question.trim() || !correctOption) {
    return res.status(400).json({ message: 'Pregunta y respuesta correcta son obligatorias.' });
  }

  const updated = await updateQuestionService(id, {
    question: question.trim(),
    optionA: optionA || '',
    optionB: optionB || '',
    optionC: optionC || '',
    correctOption
  });

  res.json(updated);
}

async function deleteQuestion(req, res) {
  await deleteQuestionService(req.params.id);
  res.status(204).end();
}

module.exports = {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
