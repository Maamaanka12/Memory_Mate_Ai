import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizHistory, generateQuiz, getNotes } from '../../services/dataService';
import Button from '../../components/common/Button';
import { Card, PageHeader, EmptyState, AlertBanner, Badge, Spinner } from '../../components/common/Misc';
import styles from './Quiz.module.css';

const STATUS_COLOR = { pending: 'warning', completed: 'success' };

export default function QuizPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [notes,   setNotes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', topic: '', quiz_type: 'mixed',
    note_id: '', num_questions: 5,
  });

  useEffect(() => {
    Promise.all([getQuizHistory(), getNotes()])
      .then(([qRes, nRes]) => {
        setQuizzes(qRes.data.data);
        setNotes(nRes.data.data);
      })
      .catch(() => setError('Failed to load quizzes.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.title) { setError('Quiz title is required.'); return; }
    setGenerating(true); setError('');
    try {
      const { data } = await generateQuiz({
        ...form,
        note_id: form.note_id || undefined,
        num_questions: parseInt(form.num_questions),
      });
      navigate(`/quiz/${data.data.quiz.id}/take`);
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Quizzes"
        subtitle="Generate and take quizzes from your notes."
        action={
          <Button onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Cancel' : '+ New Quiz'}
          </Button>
        }
      />

      <AlertBanner message={error} type="error" onClose={() => setError('')} />

      {/* Generate form */}
      {showForm && (
        <Card className={styles.genCard}>
          <h3 className={styles.genTitle}>Generate New Quiz</h3>
          <form onSubmit={handleGenerate} className={styles.genForm}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Quiz Title *</label>
                <input name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. Chapter 3 Review" className={styles.input} />
              </div>
              <div className={styles.field}>
                <label>Topic</label>
                <input name="topic" value={form.topic} onChange={handleChange}
                  placeholder="e.g. Biology" className={styles.input} />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Quiz Type</label>
                <select name="quiz_type" value={form.quiz_type} onChange={handleChange} className={styles.input}>
                  <option value="mixed">Mixed</option>
                  <option value="mcq">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="direct">Direct Questions</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Number of Questions</label>
                <input name="num_questions" type="number" min="1" max="20"
                  value={form.num_questions} onChange={handleChange} className={styles.input} />
              </div>
            </div>
            <div className={styles.field}>
              <label>Source Note (optional)</label>
              <select name="note_id" value={form.note_id} onChange={handleChange} className={styles.input}>
                <option value="">— No specific note —</option>
                {notes.map(n => (
                  <option key={n.id} value={n.id}>{n.file_name}</option>
                ))}
              </select>
            </div>
            <Button type="submit" loading={generating} size="lg">Generate Quiz</Button>
          </form>
        </Card>
      )}

      {/* Quiz list */}
      {loading ? (
        <div className={styles.center}><Spinner /></div>
      ) : quizzes.length === 0 ? (
        <EmptyState icon="🧠" title="No quizzes yet"
          message="Click '+ New Quiz' to generate your first quiz." />
      ) : (
        <div className={styles.quizGrid}>
          {quizzes.map(q => (
            <Card key={q.id} className={styles.quizCard}>
              <div className={styles.quizTop}>
                <Badge variant={STATUS_COLOR[q.status]}>{q.status}</Badge>
                <Badge variant="default">{q.quiz_type}</Badge>
              </div>
              <h3 className={styles.quizTitle}>{q.title}</h3>
              {q.topic && <p className={styles.quizTopic}>📌 {q.topic}</p>}
              <p className={styles.quizMeta}>
                {q.total_questions} questions ·{' '}
                {new Date(q.created_at).toLocaleDateString()}
              </p>
              {q.score_percentage != null && (
                <p className={styles.quizScore}>
                  Score: <strong>{Number(q.score_percentage).toFixed(1)}%</strong>
                </p>
              )}
              <div className={styles.quizActions}>
                {q.status === 'pending' ? (
                  <Button size="sm" onClick={() => navigate(`/quiz/${q.id}/take`)}>
                    Take Quiz
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary"
                    onClick={() => navigate(`/quiz/${q.id}/review`)}>
                    Review
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
