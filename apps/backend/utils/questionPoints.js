// Lógica de reparto de puntos de un test entre sus preguntas.
//
// - `maxScore` es el valor total del test (lo fija el profesor).
// - Las preguntas con `points` (valor custom) mantienen ese valor.
// - El resto del valor (`maxScore − suma de los custom`) se reparte a partes
//   iguales entre las preguntas que NO tienen valor custom.
//
// Ejemplo: test=10, 5 preguntas sin valor → 2 c/u. Si la P1 se fija en 5,
// quedan 5 puntos a repartir entre las otras 4 → 1.25 c/u.

function round2(n) {
  return Math.round(n * 100) / 100;
}

// Suma de los puntos custom de una lista de preguntas.
function sumCustomPoints(questions) {
  return questions.reduce((acc, q) => acc + (q.points != null ? Number(q.points) : 0), 0);
}

// Devuelve un Map<questionId, puntosEfectivos>.
function computeEffectivePoints(questions, maxScore) {
  const max = Number(maxScore) || 0;
  const customSum = sumCustomPoints(questions);
  const autoCount = questions.filter(q => q.points == null).length;
  const remaining = Math.max(max - customSum, 0);
  const perAuto = autoCount > 0 ? remaining / autoCount : 0;

  const map = new Map();
  let autoIndex = 0;
  let autoAssigned = 0;
  for (const q of questions) {
    if (q.points != null) {
      map.set(q.id, round2(Number(q.points)));
      continue;
    }
    autoIndex += 1;
    // La última pregunta automática absorbe el resto del redondeo para que
    // la suma de todos los puntos sea exactamente el valor del test.
    const pts = autoIndex === autoCount
      ? round2(remaining - autoAssigned)
      : round2(perAuto);
    autoAssigned += pts;
    map.set(q.id, pts);
  }
  return map;
}

export { computeEffectivePoints, sumCustomPoints, round2 };
