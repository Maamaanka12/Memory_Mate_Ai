import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { AlertBanner } from '../../components/common/Misc';
import styles from './Auth.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await loginApi(form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.brandIcon}>✦</span>
          <h1>MemoryMate <span className={styles.ai}>AI</span></h1>
        </div>
        <p className={styles.subtitle}>Welcome back. Sign in to continue.</p>

        <AlertBanner message={error} type="error" onClose={() => setError('')} />

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input label="Email" name="email" type="email"
            value={form.email} onChange={handleChange}
            placeholder="you@example.com" required />
          <Input label="Password" name="password" type="password"
            value={form.password} onChange={handleChange}
            placeholder="••••••••" required />
          <Button type="submit" loading={loading} fullWidth size="lg">
            Sign In
          </Button>
        </form>

        <p className={styles.switch}>
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
