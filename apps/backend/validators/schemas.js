import { z } from 'zod';

// ── Helpers ───────────────────────────────────────────────────────────────────

// Texto obligatorio: cubre tanto "campo ausente" como "solo espacios".
const requiredText = (msg) => z.string({ error: msg }).trim().min(1, msg);

// Texto opcional que por defecto es cadena vacía (como hacían los controllers).
const optionalText = z.string().trim().optional().default('');

const EMPTY = (v) => v === '' || v === undefined || v === null;

// Número > 0 con default cuando no se envía (p. ej. valor del test al crear).
const positiveWithDefault = (msg, fallback) =>
  z.preprocess((v) => (EMPTY(v) ? fallback : v), z.coerce.number({ error: msg }).positive(msg));

// Número > 0 opcional: ausente => undefined (el servicio conserva el actual).
const optionalPositive = (msg) =>
  z.preprocess((v) => (EMPTY(v) ? undefined : v), z.coerce.number({ error: msg }).positive(msg).optional());

// Entero > 0; ausente => `fallback` (o undefined si no se da).
const orderNumber = (fallback) =>
  z.preprocess((v) => (EMPTY(v) ? fallback : v), z.coerce.number().int().positive().optional());

// Puntos custom de una pregunta: ausente => undefined (reparto automático).
const POINTS_MSG = 'Los puntos deben ser un número mayor o igual que 0.';
const optionalPoints = z.preprocess(
  (v) => (EMPTY(v) ? undefined : v),
  z.coerce.number({ error: POINTS_MSG }).min(0, POINTS_MSG).optional(),
);

const TITLE_MSG = 'El título es obligatorio.';
const SCORE_MSG = 'El valor del test debe ser un número mayor que 0.';
const ROLE_MSG = 'Rol no válido.';

// ── Courses ───────────────────────────────────────────────────────────────────

export const courseSchema = z.object({
  title: requiredText(TITLE_MSG).max(200, 'El título es demasiado largo.'),
  description: optionalText,
});

// ── Lessons ───────────────────────────────────────────────────────────────────

export const createLessonSchema = z.object({
  title: requiredText(TITLE_MSG),
  content: optionalText,
  orderNumber: orderNumber(1),
});

export const updateLessonSchema = z.object({
  title: requiredText(TITLE_MSG),
  content: optionalText,
  orderNumber: orderNumber(undefined),
});

// ── Tests ─────────────────────────────────────────────────────────────────────

export const createTestSchema = z.object({
  title: requiredText(TITLE_MSG),
  description: optionalText,
  maxScore: positiveWithDefault(SCORE_MSG, 10),
});

export const updateTestSchema = z.object({
  title: requiredText(TITLE_MSG),
  description: optionalText,
  maxScore: optionalPositive(SCORE_MSG),
});

// ── Questions ─────────────────────────────────────────────────────────────────

export const questionSchema = z.object({
  question: requiredText('La pregunta es obligatoria.'),
  optionA: optionalText,
  optionB: optionalText,
  optionC: optionalText,
  correctOption: z.enum(['A', 'B', 'C'], { error: 'La respuesta correcta debe ser A, B o C.' }),
  points: optionalPoints,
});

// ── Results ───────────────────────────────────────────────────────────────────

const ANSWERS_MSG = 'Se requieren respuestas en formato array.';
export const submitTestSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.coerce.number(),
      answer: z.string().optional().default(''),
    }),
    { error: ANSWERS_MSG },
  ),
});

// ── Users ─────────────────────────────────────────────────────────────────────

export const changeRoleSchema = z.object({
  role: z.enum(['alumno', 'profesor', 'administrador'], { error: ROLE_MSG }),
});

export const updateUserSchema = z.object({
  name: requiredText('El nombre es obligatorio.'),
  email: z.email('Email no válido.').optional(),
});

// ── Admin auth ────────────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
  username: requiredText('El usuario es obligatorio.'),
  password: requiredText('La contraseña es obligatoria.'),
});
