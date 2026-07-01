import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { to: '/notes',     label: 'My Notes',  icon: '📄' },
  { to: '/quiz',      label: 'Quizzes',   icon: '🧠' },
  { to: '/reports',   label: 'Reports',   icon: '📊' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <span className={styles.brandIcon}>✦</span>
        <span className={styles.brandName}>MemoryMate</span>
        <span className={styles.brandAI}>AI</span>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className={styles.userText}>
            <p className={styles.userName}>{user?.name}</p>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
