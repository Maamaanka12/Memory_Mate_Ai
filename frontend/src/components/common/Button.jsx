import styles from './Button.module.css';

export default function Button({
  children, onClick, type = 'button',
  variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.full : '',
      ].join(' ')}
    >
      {loading ? <span className={styles.spinner} /> : children}
    </button>
  );
}
