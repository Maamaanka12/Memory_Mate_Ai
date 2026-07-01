import { useEffect, useState } from 'react';
import { getReports } from '../../services/dataService';
import { Card, PageHeader, EmptyState, Spinner, Badge } from '../../components/common/Misc';
import styles from './Reports.module.css';

export default function ReportsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getReports()
      .then(res => setData(res.data.data))
      .catch(() => setError('Failed to load reports.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.center}><Spinner size="lg" /></div>;

  const { progression = [], topics = [], history = [] } = data || {};

  return (
    <div>
      <PageHeader title="Reports" subtitle="Track your performance over time." />

      {error && <p className={styles.errorText}>{error}</p>}

      {/* Score progression — simple bar chart */}
      <Card className={styles.section}>
        <h3 className={styles.sectionTitle}>Score Progression</h3>
        {progression.length === 0 ? (
          <EmptyState icon="📈" title="No data yet" message="Complete quizzes to see progression." />
        ) : (
          <div className={styles.barChart}>
            {progression.map((p, i) => (
              <div key={i} className={styles.barItem}>
                <div className={styles.barWrap}>
                  <div
                    className={styles.bar}
                    style={{ height: `${Math.max(4, p.score_percentage)}%` }}
                    title={`${Number(p.score_percentage).toFixed(1)}%`}
                  />
                </div>
                <p className={styles.barLabel}>
                  {new Date(p.completed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </p>
                <p className={styles.barScore}>{Number(p.score_percentage).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Topic breakdown */}
      <Card className={styles.section}>
        <h3 className={styles.sectionTitle}>Topic Breakdown</h3>
        {topics.length === 0 ? (
          <EmptyState icon="📌" title="No topics yet"
            message="Tag your notes and quizzes with topics to see breakdown." />
        ) : (
          <div className={styles.topicGrid}>
            {topics.map((t, i) => (
              <div key={i} className={styles.topicCard}>
                <div className={styles.topicHeader}>
                  <span className={styles.topicName}>{t.topic}</span>
                  <Badge variant={Number(t.avg_score) >= 70 ? 'success' : 'danger'}>
                    {Number(t.avg_score).toFixed(0)}%
                  </Badge>
                </div>
                <div className={styles.topicBar}>
                  <div className={styles.topicFill}
                    style={{ width: `${Math.min(100, t.avg_score)}%` }} />
                </div>
                <p className={styles.topicMeta}>
                  {t.attempts} attempt{t.attempts !== 1 ? 's' : ''} ·
                  Best: {Number(t.best_score).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quiz history table */}
      <Card className={styles.section}>
        <h3 className={styles.sectionTitle}>Quiz History</h3>
        {history.length === 0 ? (
          <EmptyState icon="🧠" title="No history yet" />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Topic</th>
                  <th>Score</th>
                  <th>Questions</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i}>
                    <td>{h.title}</td>
                    <td>{h.topic || '—'}</td>
                    <td>
                      <Badge variant={Number(h.score_percentage) >= 70 ? 'success' : 'danger'}>
                        {Number(h.score_percentage).toFixed(1)}%
                      </Badge>
                    </td>
                    <td>{h.correct_answers}/{h.total_questions}</td>
                    <td>{new Date(h.completed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
