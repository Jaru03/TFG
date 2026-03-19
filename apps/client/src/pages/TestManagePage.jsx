import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Button from '../components/Button';

export default function TestManagePage({ user }) {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({ question: '', optionA: '', optionB: '', optionC: '', correctOption: 'A' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
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
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleCreate = async ev => {
    ev.preventDefault();
    setError(null);
    try {
      await axios.post(`/api/tests/${id}/questions`, {
        ...form,
        question: form.question.trim()
      });
      setForm({ question: '', optionA: '', optionB: '', optionC: '', correctOption: 'A' });
      load();
    } catch (err) {
      setError('No se pudo agregar la pregunta.');
    }
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <>
      <Header />
      <main className="container">
        <section>
          <h1>Gestionar preguntas del test</h1>

          <p>
            <Button to="/courses">Volver a cursos</Button>
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="card">
            <h2>{test.title}</h2>
            <p>{test.description}</p>
          </div>

          <form className="form" onSubmit={handleCreate}>
            <h2>Añadir pregunta</h2>
            <div className="form-group">
              <label>Enunciado</label>
              <textarea
                value={form.question}
                onChange={e => setForm(prev => ({ ...prev, question: e.target.value }))}
                rows={3}
                required
              />
            </div>
            <div className="form-group">
              <label>Opción A</label>
              <input
                value={form.optionA}
                onChange={e => setForm(prev => ({ ...prev, optionA: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Opción B</label>
              <input
                value={form.optionB}
                onChange={e => setForm(prev => ({ ...prev, optionB: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Opción C</label>
              <input
                value={form.optionC}
                onChange={e => setForm(prev => ({ ...prev, optionC: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Respuesta correcta</label>
              <select
                value={form.correctOption}
                onChange={e => setForm(prev => ({ ...prev, correctOption: e.target.value }))}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            <Button type="submit">Agregar pregunta</Button>
          </form>

          <h2>Preguntas existentes</h2>
          {questions.length === 0 ? (
            <div className="card">Aún no hay preguntas.</div>
          ) : (
            questions.map(q => (
              <div key={q.id} className="card">
                <h3>{q.question}</h3>
                <p>A) {q.option_a}</p>
                <p>B) {q.option_b}</p>
                <p>C) {q.option_c}</p>
                <p>
                  <strong>Correcta:</strong> {q.correct_option}
                </p>
              </div>
            ))
          )}
        </section>
      </main>
    </>
  );
}
