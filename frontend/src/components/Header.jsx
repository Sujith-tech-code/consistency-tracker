import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { username, logout } = useAuth();

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
  },
  brand: { fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em' },
  right: { display: 'flex', alignItems: 'center', gap: '1rem' },
  username: { color: 'var(--text-secondary)', fontSize: '0.9rem' },
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