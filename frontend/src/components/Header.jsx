import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { username, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={styles.header}
    >
      <div style={styles.brand}>
        Physique<span style={{ color: 'var(--accent)' }}>.</span>
      </div>
      <div style={styles.right}>
        <span style={styles.username}>{username}</span>

        <motion.button
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.08 }}
          onClick={toggleTheme}
          style={styles.themeBtn}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'inline-block', fontSize: '1rem' }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.03 }}
          onClick={logout}
          style={styles.logoutBtn}
        >
          Logout
        </motion.button>
      </div>
    </motion.header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-elevated)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: { fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em' },
  right: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  username: { color: 'var(--text-secondary)', fontSize: '0.9rem' },
  themeBtn: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    padding: '0.45rem 0.9rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};