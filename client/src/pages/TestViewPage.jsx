import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

export default function TestViewPage({ user }) {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [testRes, qRes] = await Promise.all([
          axios.get(`/api/tests/${id}`),
          axios.get(`/api/tests/${id}/questions`)
        ]);
        setTest(testRes.data);
        setQuestions(qRes.data);
      } catch (err) {
        setError('No se pudo cargar el test.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async ev => {
    ev.preventDefault();
    setError(null);
    try {
      const payload = {
        answers: questions.map(q => ({ questionId: q.id, answer: answers[q.id] || '' }))
      };
      const res = await axios.post(`/api/results/tests/${id}/submit`, payload);
      setResult(res.data);
    } catch (err) {
      setError('Error al enviar el test.');
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <Header user={user} />
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <>
      <Header user={user} />
      <main className="container">
        <section>
          <h1>{test.title}</h1>
          <p>{test.description}</p>
          <p>
            <Link className="button" to="/courses">
              Volver a cursos
            </Link>
          </p>

          {result ? (
            <div className="card">
              <h2>Resultado</h2>
              <p>
                Has obtenido <strong>{result.score}</strong> de <strong>{result.total}</strong>.
              </p>
            </div>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              {questions.map(q => (
                <div key={q.id} className="card">
                  <h3>{q.question}</h3>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value="A"
                        checked={answers[q.id] === 'A'}
                        onChange={() => handleChange(q.id, 'A')}
                      />{' '}
                      {q.option_a}
                    </label>
                  </div>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value="B"
                        checked={answers[q.id] === 'B'}
                        onChange={() => handleChange(q.id, 'B')}
                      />{' '}
                      {q.option_b}
                    </label>
                  </div>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value="C"
                        checked={answers[q.id] === 'C'}
                        onChange={() => handleChange(q.id, 'C')}
                      />{' '}
                      {q.option_c}
                    </label>
                  </div>
                </div>
              ))}

              <button className="button" type="submit">
                Enviar respuestas
              </button>
            </form>
          )}
        </section>
      </main>
    </>
  );
}
