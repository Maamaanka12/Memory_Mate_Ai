import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register as registerApi } from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { AlertBanner } from '../../components/common/Misc';
import styles from './Auth.module.css';

export default function RegisterPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())      e.name = 'Name is required.';
    if (!form.email.trim())     e.email = 'Email is required.';
    if (form.password.length < 6) e.password = 'Minimum 6 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      const { data } = await registerApi({ name: form.name, email: form.email, password: form.password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>✦</span>
          <h1>MemoryMate <span className={styles.ai}>AI</span></h1>
        </div>
        <p className={styles.subtitle}>Create your account to get started.</p>

        <AlertBanner message={apiError} type="error" onClose={() => setApiError('')} />

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input label="Full Name" name="name" value={form.name}
            onChange={handleChange} placeholder="Alex Johnson"
            error={errors.name} required />
          <Input label="Email" name="email" type="email" value={form.email}
            onChange={handleChange} placeholder="you@example.com"
            error={errors.email} required />
          <Input label="Password" name="password" type="password" value={form.password}
            onChange={handleChange} placeholder="Min. 6 characters"
            error={errors.password} required />
          <Input label="Confirm Password" name="confirm" type="password" value={form.confirm}
            onChange={handleChange} placeholder="Repeat password"
            error={errors.confirm} required />
          <Button type="submit" loading={loading} fullWidth size="lg">
            Create Account
          </Button>
        </form>

        <p className={styles.switch}>
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
