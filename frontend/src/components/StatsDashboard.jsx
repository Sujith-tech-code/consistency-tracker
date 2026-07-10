import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

export default function StatsDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/days/stats');
        setStats(res.data);
      } catch {
        setStats(null);
      }
    };
    fetchStats();
  }, []);

 if (!stats) return (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.wrapper}>
    <h3 style={styles.title}>Consistency</h3>
    <div style={styles.grid}>
      {[1,2,3,4,5].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.1 }}
          style={{ ...styles.card, height: '100px' }}
        />
      ))}
    </div>
  </motion.div>
);

  const cards = [
    { label: 'Current Streak', value: `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`, emoji: '🔥' },
    { label: 'Longest Streak', value: `${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`, emoji: '🏆' },
    { label: 'This Month', value: `${stats.monthActiveDays}/${stats.monthTotalDaysSoFar} days`, emoji: '📅' },
    { label: 'Completion Rate', value: `${stats.completionRate}%`, emoji: '✅' },
    { label: 'Total Workouts', value: stats.totalWorkouts, emoji: '💪' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={styles.wrapper}>
      <h3 style={styles.title}>Consistency</h3>
      <div style={styles.grid}>
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03 }}
            style={styles.card}
          >
            <div style={styles.emoji}>{c.emoji}</div>
            <div style={styles.value}>{c.value}</div>
            <div style={styles.label}>{c.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

const styles = {
  wrapper: { background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem', marginTop: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  title: { margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' },
 card: { background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.75rem 1rem', textAlign: 'center' },
  emoji: { fontSize: '1.4rem', marginBottom: '0.4rem' },
  value: { fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)' },
  label: { fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' },
};