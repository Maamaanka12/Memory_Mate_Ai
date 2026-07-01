import styles from './Input.module.css';

export default function Input({
  label, name, type = 'text', value, onChange,
  placeholder, error, required = false, disabled = false,
}) {
  return (
    <div className={styles.group}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label} {required && <span className={styles.req}>*</span>}
        </label>
      )}
      <input
        id={name} name={name} type={type}
        value={value} onChange={onChange}
        placeholder={placeholder}
        required={required} disabled={disabled}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
