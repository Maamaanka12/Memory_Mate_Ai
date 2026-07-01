import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, exportQuizPDF } from '../../services/dataService';
import Button from '../../components/common/Button';
import { Card, Spinner, Badge, PageHeader, AlertBanner } from '../../components/common/Misc';
import styles from './Quiz.module.css';

export default function QuizReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    getQuizById(id)
      .then(res => setData(res.data.data))
      .catch(() => setError('Failed to load review.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportQuizPDF(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz-${id}-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('PDF export failed.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className={styles.center}><Spinner size="lg" /></div>;
  if (!data)   return <p className={styles.errorText}>{error || 'Quiz not found.'}</p>;

  const { quiz, questions, answers } = data;
  const answerMap = {};
  answers.forEach(a => { answerMap[a.question_id] = a; });

  const correct = answers.filter(a => a.is_correct).length;
  const pct = questions.length > 0 ? ((correct / questions.length) * 100).toFixed(1) : 0;

  return (
    <div>
      <PageHeader
        title="Quiz Review"
        subtitle={quiz.title}
        action={
          <div className={styles.reviewActions}>
            <Button variant="secondary" onClick={() => navigate('/quiz')}>
              ← Back
            </Button>
            <Button loading={exporting} onClick={handleExport}>
              Export PDF
            </Button>
          </div>
        }
      />

      <AlertBanner message={error} type="error" onClose={() => setError('')} />

      {/* Score summary */}
      <Card className={styles.scoreCard}>
        <div className={styles.scoreBig}>{pct}%</div>
        <p className={styles.scoreDetail}>
          {correct} correct out of {questions.length} questions
        </p>
        <Badge variant={Number(pct) >= 70 ? 'success' : 'danger'}>
          {Number(pct) >= 70 ? 'Passed' : 'Needs Review'}
        </Badge>
      </Card>

      {/* Questions review */}
      <div className={styles.questionList}>
        {questions.map((q, idx) => {
          const ans = answerMap[q.id];
          const isCorrect = ans?.is_correct;
          return (
            <Card key={q.id}
              className={`${styles.reviewCard} ${isCorrect ? styles.correct : styles.wrong}`}>
              <div className={styles.reviewTop}>
                <span className={styles.questionNum}>Q{idx + 1}</span>
                <Badge variant={isCorrect ? 'success' : 'danger'}>
                  {isCorrect ? '✓ Correct' : '✗ Wrong'}
                </Badge>
              </div>
              <p className={styles.questionText}>{q.question_text}</p>
              <div className={styles.reviewAnswers}>
                <p className={styles.yourAnswer}>
                  Your answer: <strong>{ans?.user_answer || '—'}</strong>
                </p>
                {!isCorrect && (
                  <p className={styles.correctAnswer}>
                    Correct: <strong>{q.correct_answer}</strong>
                  </p>
                )}
              </div>
              {q.explanation && (
                <p className={styles.explanation}>💡 {q.explanation}</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
