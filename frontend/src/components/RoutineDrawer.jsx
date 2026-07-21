import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const today = new Date();
const formatDateInput = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function RoutineDrawer({ open, onClose, onRoutineApplied }) {
  const [routine, setRoutine] = useState({
    monday: [], tuesday: [], wednesday: [], thursday: [],
    friday: [], saturday: [], sunday: [],
  });
  const [newExercise, setNewExercise] = useState({});
  const [startDate, setStartDate] = useState(formatDateInput(today));
  const [endDate, setEndDate] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');
  const [saveTimer, setSaveTimer] = useState(null);
  const [activeDay, setActiveDay] = useState('monday');

  useEffect(() => {
    if (!open) return;
    const fetchRoutine = async () => {
      try {
        const res = await axiosInstance.get('/routines');
        setRoutine(res.data.routine);
      } catch {}
    };
    fetchRoutine();
  }, [open]);

  const autoSave = useCallback((updatedRoutine) => {
    if (saveTimer) clearTimeout(saveTimer);
    const timer = setTimeout(async () => {
      try {
        await axiosInstance.put('/routines', { routine: updatedRoutine });
      } catch {}
    }, 800);
    setSaveTimer(timer);
  }, [saveTimer]);

  const addExercise = (day) => {
    const name = (newExercise[day] || '').trim();
    if (!name) return;
    const updated = { ...routine, [day]: [...routine[day], name] };
    setRoutine(updated);
    setNewExercise((prev) => ({ ...prev, [day]: '' }));
    autoSave(updated);
  };

  const removeExercise = (day, idx) => {
    const updated = { ...routine, [day]: routine[day].filter((_, i) => i !== idx) };
    setRoutine(updated);
    autoSave(updated);
  };

  const handleApply = async () => {
    if (!startDate || !endDate) { setApplyMsg('Please set both dates.'); return; }
    if (endDate < startDate) { setApplyMsg('End date must be after start date.'); return; }
    setApplying(true);
    setApplyMsg('');
    try {
      await axiosInstance.post('/routines/apply', { startDate, endDate });
      setApplyMsg('Routine applied! 🎉');
      if (onRoutineApplied) onRoutineApplied();
    } catch {
      setApplyMsg('Failed to apply. Try again.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={styles.backdrop}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={styles.drawer}
          >
            {/* Handle bar */}
            <div style={styles.handleBar} />

            {/* Header */}
            <div style={styles.drawerHeader}>
              <h2 style={styles.drawerTitle}>Weekly Routine</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={styles.closeBtn}
              >✕</motion.button>
            </div>

            {/* Day tabs */}
            <div style={styles.dayTabs}>
              {DAYS.map((day, i) => (
                <motion.button
                  key={day}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setActiveDay(day)}
                  style={{
                    ...styles.dayTab,
                    background: activeDay === day ? 'var(--accent)' : 'var(--bg-input)',
                    color: activeDay === day ? '#0d0f12' : 'var(--text-secondary)',
                    fontWeight: activeDay === day ? 700 : 400,
                  }}
                >
                  {DAY_SHORT[i]}
                  {routine[day].length > 0 && (
                    <span style={{
                      ...styles.dayBadge,
                      background: activeDay === day ? '#0d0f12' : 'var(--accent)',
                      color: activeDay === day ? 'var(--accent)' : '#0d0f12',
                    }}>
                      {routine[day].length}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Active day content */}
            <div style={styles.dayContent}>
              <h3 style={styles.activeDayLabel}>
                {DAY_LABELS[DAYS.indexOf(activeDay)]}
                <span style={styles.exerciseCount}>
                  {routine[activeDay].length} exercise{routine[activeDay].length !== 1 ? 's' : ''}
                </span>
              </h3>

              <div style={styles.exerciseList}>
                <AnimatePresence>
                  {routine[activeDay].map((ex, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      style={styles.exRow}
                    >
                      <span style={styles.exNumber}>{idx + 1}</span>
                      <span style={styles.exName}>{ex}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeExercise(activeDay, idx)}
                        style={styles.removeBtn}
                      >✕</motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {routine[activeDay].length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={styles.emptyText}
                  >
                    No exercises yet — add one below
                  </motion.p>
                )}
              </div>

              {/* Add exercise input */}
              <div style={styles.addRow}>
                <input
                  style={styles.addInput}
                  placeholder={`Add exercise for ${DAY_LABELS[DAYS.indexOf(activeDay)]}...`}
                  value={newExercise[activeDay] || ''}
                  onChange={(e) => setNewExercise((prev) => ({ ...prev, [activeDay]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && addExercise(activeDay)}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addExercise(activeDay)}
                  style={styles.addBtn}
                >+</motion.button>
              </div>
            </div>

            {/* Apply section */}
            <div style={styles.applySection}>
              <p style={styles.applyTitle}>Apply Routine to Date Range</p>
              <div style={styles.dateRow}>
                <div style={styles.dateGroup}>
                  <label style={styles.dateLabel}>From</label>
                  <input
                    type="date"
                    value={startDate}
                    min={formatDateInput(today)}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={styles.dateInput}
                  />
                </div>
                <div style={styles.dateGroup}>
                  <label style={styles.dateLabel}>To</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={styles.dateInput}
                  />
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={handleApply}
                disabled={applying}
                style={styles.applyBtn}
              >
                {applying ? 'Applying...' : '✓ Apply Routine'}
              </motion.button>
              {applyMsg && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    marginTop: '0.5rem',
                    color: applyMsg.includes('🎉') ? 'var(--accent)' : 'var(--danger)',
                  }}
                >
                  {applyMsg}
                </motion.p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const styles = {
  backdrop: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 200,
    backdropFilter: 'blur(2px)',
  },
  drawer: {
    position: 'fixed',
    bottom: 0, left: 0, right: 0,
    background: 'var(--bg-elevated)',
    borderRadius: '20px 20px 0 0',
    zIndex: 201,
    padding: '0 1.25rem 2rem',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 -4px 40px rgba(34,197,94,0.15)',
  },
  handleBar: {
    width: '40px', height: '4px',
    background: 'var(--border-color)',
    borderRadius: '2px',
    margin: '12px auto 8px',
  },
  drawerHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1rem',
    paddingTop: '0.5rem',
  },
  drawerTitle: { margin: 0, fontSize: '1.2rem', fontWeight: 700 },
  closeBtn: {
    background: 'var(--bg-input)',
    border: 'none', color: 'var(--text-secondary)',
    borderRadius: '50%', width: '32px', height: '32px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: '0.85rem',
  },
  dayTabs: {
    display: 'flex', gap: '6px',
    overflowX: 'auto', paddingBottom: '0.5rem',
    marginBottom: '1rem',
  },
  dayTab: {
    flexShrink: 0, border: 'none',
    borderRadius: '20px', padding: '0.4rem 0.75rem',
    fontSize: '0.8rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '4px',
    transition: 'all 0.2s',
  },
  dayBadge: {
    borderRadius: '50%', width: '16px', height: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.65rem', fontWeight: 700,
  },
  dayContent: {
    background: 'var(--bg-input)',
    borderRadius: '12px', padding: '1rem',
    marginBottom: '1rem', minHeight: '180px',
  },
  activeDayLabel: {
    margin: '0 0 0.75rem 0', fontSize: '1rem',
    fontWeight: 600, display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
  },
  exerciseCount: { fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 },
  exerciseList: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '0.75rem' },
  exRow: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    background: 'var(--bg-elevated)', borderRadius: '8px',
    padding: '0.5rem 0.75rem',
  },
  exNumber: {
    fontSize: '0.75rem', color: 'var(--accent)',
    fontWeight: 700, minWidth: '18px',
  },
  exName: { flex: 1, fontSize: '0.9rem' },
  removeBtn: {
    background: 'transparent', border: 'none',
    color: 'var(--danger)', cursor: 'pointer',
    fontSize: '0.8rem', padding: 0,
  },
  emptyText: {
    color: 'var(--text-secondary)', fontSize: '0.85rem',
    fontStyle: 'italic', textAlign: 'center',
    margin: '1rem 0',
  },
  addRow: { display: 'flex', gap: '8px' },
  addInput: {
    flex: 1, background: 'var(--bg-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px', padding: '0.6rem 0.75rem',
    color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
  },
  addBtn: {
    background: 'var(--accent)', color: '#0d0f12',
    border: 'none', borderRadius: '8px',
    padding: '0.6rem 1rem', fontWeight: 700,
    cursor: 'pointer', fontSize: '1rem',
  },
  applySection: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
  },
  applyTitle: {
    margin: '0 0 0.75rem 0', fontSize: '0.9rem',
    fontWeight: 600,
  },
  dateRow: { display: 'flex', gap: '1rem', marginBottom: '1rem' },
  dateGroup: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  dateLabel: { fontSize: '0.75rem', color: 'var(--text-secondary)' },
  dateInput: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px', padding: '0.5rem 0.6rem',
    color: 'var(--text-primary)', fontSize: '0.85rem',
    outline: 'none', width: '100%',
  },
  applyBtn: {
    width: '100%', background: 'var(--accent)',
    color: '#0d0f12', border: 'none',
    borderRadius: '10px', padding: '0.8rem',
    fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
  },
};