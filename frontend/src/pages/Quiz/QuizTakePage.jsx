import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, submitQuiz } from '../../services/dataService';
import Button from '../../components/common/Button';
import { Card, Spinner, AlertBanner } from '../../components/common/Misc';
import styles from './Quiz.module.css';

export default function QuizTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz]         = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]   = useState({});
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');
  const [startTime] = useState(Date.now());

  useEffect(() => {
    getQuizById(id)
      .then(res => {
        setQuiz(res.data.data.quiz);
        setQuestions(res.data.data.questions);
      })
      .catch(() => setError('Failed to load quiz.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnswer = (questionId, value) =>
    setAnswers(prev => ({ ...prev, [questionId]: value }));

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Please answer all questions. (${unanswered.length} remaining)`);
      return;
    }
    setSubmitting(true); setError('');
    const payload = {
      quiz_id: parseInt(id),
      time_taken_seconds: Math.round((Date.now() - startTime) / 1000),
      answers: questions.map(q => ({
        question_id: q.id,
        user_answer: answers[q.id],
      })),
    };
    try {
      await submitQuiz(payload);
      navigate(`/quiz/${id}/review`);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.center}><Spinner size="lg" /></div>;
  if (!quiz)   return <p className={styles.errorText}>{error || 'Quiz not found.'}</p>;

  return (
    <div className={styles.takePage}>
      <div className={styles.takeHeader}>
        <div>
          <h1 className={styles.takeTitle}>{quiz.title}</h1>
          {quiz.topic && <p className={styles.takeMeta}>📌 {quiz.topic}</p>}
        </div>
        <div className={styles.takeMeta}>
          {Object.keys(answers).length} / {questions.length} answered
        </div>
      </div>

      <AlertBanner message={error} type="error" onClose={() => setError('')} />

      <div className={styles.questionList}>
        {questions.map((q, idx) => (
          <Card key={q.id} className={styles.questionCard}>
            <p className={styles.questionNum}>Question {idx + 1}</p>
            <p className={styles.questionText}>{q.question_text}</p>

            {/* MCQ */}
            {q.question_type === 'mcq' && q.options && (
              <div className={styles.options}>
                {q.options.map(opt => (
                  <label key={opt}
                    className={`${styles.optionLabel} ${answers[q.id] === opt ? styles.selected : ''}`}>
                    <input type="radio" name={`q_${q.id}`} value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleAnswer(q.id, opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {/* True/False */}
            {q.question_type === 'true_false' && (
              <div className={styles.options}>
                {['True', 'False'].map(opt => (
                  <label key={opt}
                    className={`${styles.optionLabel} ${answers[q.id] === opt ? styles.selected : ''}`}>
                    <input type="radio" name={`q_${q.id}`} value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleAnswer(q.id, opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {/* Direct */}
            {q.question_type === 'direct' && (
              <input
                className={styles.directInput}
                placeholder="Type your answer..."
                value={answers[q.id] || ''}
                onChange={e => handleAnswer(q.id, e.target.value)}
              />
            )}
          </Card>
        ))}
      </div>

      <div className={styles.submitRow}>
        <Button size="lg" loading={submitting} onClick={handleSubmit}>
          Submit Quiz
        </Button>
      </div>
    </div>
  );
}
