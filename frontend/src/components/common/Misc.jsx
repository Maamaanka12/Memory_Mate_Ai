import styles from './Misc.module.css';

export function Card({ children, className = '' }) {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}

export function Spinner({ size = 'md' }) {
  return <div className={`${styles.spinner} ${styles[size]}`} />;
}

export function Badge({ children, variant = 'default' }) {
  return <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSub}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ icon = '📭', title, message }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>{icon}</span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>
  );
}

export function AlertBanner({ message, type = 'error', onClose }) {
  if (!message) return null;
  return (
    <div className={`${styles.alert} ${styles[type]}`}>
      <span>{message}</span>
      {onClose && <button className={styles.alertClose} onClick={onClose}>✕</button>}
    </div>
  );
}
