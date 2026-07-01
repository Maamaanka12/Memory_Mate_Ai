import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboard } from '../../services/dataService';
import { Card, Spinner, PageHeader } from '../../components/common/Misc';
import styles from './Dashboard.module.css';

const StatCard = ({ icon, label, value, sub }) => (
  <Card className={styles.statCard}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
    {sub && <div className={styles.statSub}>{sub}</div>}
  </Card>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    getDashboard()
      .then(res => setStats(res.data.data))
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className={styles.center}>
      <Spinner size="lg" />
    </div>
  );

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Here's your study overview."
      />

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.grid}>
        <StatCard icon="📈" label="Average Score"
          value={stats ? `${Number(stats.avg_score).toFixed(1)}%` : '—'} />
        <StatCard icon="📄" label="Notes Uploaded"
          value={stats?.notes_uploaded ?? 0} />
        <StatCard icon="🧠" label="Quizzes Completed"
          value={stats?.quizzes_completed ?? 0} />
        <StatCard icon="🏆" label="Strongest Topic"
          value={stats?.strongest_topic ?? 'N/A'} />
        <StatCard icon="📉" label="Weakest Topic"
          value={stats?.weakest_topic ?? 'N/A'} />
      </div>

      {/* Future: AI insights placeholder */}
      <Card className={styles.aiCard}>
        <div className={styles.aiHeader}>
          <span className={styles.aiIcon}>✦</span>
          <span className={styles.aiLabel}>AI Insights</span>
          <span className={styles.aiPill}>Coming Soon</span>
        </div>
        <p className={styles.aiText}>
          Personalised study recommendations powered by Cognee memory integration
          will appear here once activated.
        </p>
      </Card>
    </div>
  );
}
