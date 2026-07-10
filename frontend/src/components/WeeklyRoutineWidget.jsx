import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const today = new Date();
const formatDateInput = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function WeeklyRoutineWidget({ onRoutineApplied }) {
  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const res = await axiosInstance.get('/routines');
        setRoutine(res.data.routine);
      } catch {
        // keep default empty routine
      }
    };
    fetchRoutine();
  }, []);

  const autoSave = useCallback((updatedRoutine) => {
    if (saveTimer) clearTimeout(saveTimer);
    const timer = setTimeout(async () => {
      try {
        await axiosInstance.put('/routines', { routine: updatedRoutine });
      } catch {
        // silent fail
      }
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
    if (!startDate || !endDate) {
      setApplyMsg('Please set both start and end dates.');
      return;
    }
    if (endDate < startDate) {
      setApplyMsg('End date must be after start date.');
      return;
    }
    setApplying(true);
    setApplyMsg('');
    try {
      await axiosInstance.post('/routines/apply', { startDate, endDate });
      setApplyMsg('Routine applied successfully!');
      if (onRoutineApplied) onRoutineApplied();
    } catch {
      setApplyMsg('Failed to apply routine. Try again.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        style={styles.toggleBtn}
      >
        <span>Weekly Routine</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ display: 'inline-block' }}
        >
          ▾
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={styles.panel}>
              <div style={styles.daysGrid}>
                {DAYS.map((day, i) => (
                  <div key={day} style={styles.dayCol}>
                    <div style={styles.dayLabel}>{DAY_LABELS[i]}</div>
                    {routine[day].map((ex, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={styles.exRow}
                      >
                        <span style={styles.exName}>{ex}</span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeExercise(day, idx)}
                          style={styles.removeBtn}
                        >✕</motion.button>
                      </motion.div>
                    ))}
                    <div style={styles.addRow}>
                      <input
                        style={styles.addInput}
                        placeholder="Add..."
                        value={newExercise[day] || ''}
                        onChange={(e) => setNewExercise((prev) => ({ ...prev, [day]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && addExercise(day)}
                      />
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addExercise(day)}
                        style={styles.addBtn}
                      >+</motion.button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.applyRow}>
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
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleApply}
                  disabled={applying}
                  style={styles.applyBtn}
                >
                  {applying ? 'Applying...' : 'Apply Routine'}
                </motion.button>
                {applyMsg && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      fontSize: '0.8rem',
                      color: applyMsg.includes('success') ? 'var(--accent)' : 'var(--danger)',
                    }}
                  >
                    {applyMsg}
                  </motion.span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  wrapper: { padding: '0 1.5rem', marginBottom: '0.5rem' },
  toggleBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'var(--bg-elevated)', border: '1px solid var(--border-color)',
    color: 'var(--text-primary)', borderRadius: '10px', padding: '0.6rem 1.2rem',
    fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', width: '100%',
    justifyContent: 'space-between',
  },
  panel: { background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', marginTop: '0.5rem' },
  daysGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', marginBottom: '1.25rem' },
  dayCol: { display: 'flex', flexDirection: 'column', gap: '6px' },
  dayLabel: { fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' },
  exRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-input)', borderRadius: '6px', padding: '0.3rem 0.5rem', gap: '4px' },
  exName: { fontSize: '0.75rem', flex: 1, wordBreak: 'break-word' },
  removeBtn: { background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.7rem', padding: 0 },
  addRow: { display: 'flex', gap: '4px' },
  addInput: { flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.3rem 0.4rem', color: 'var(--text-primary)', fontSize: '0.75rem', outline: 'none', minWidth: 0 },
  addBtn: { background: 'var(--accent)', color: '#0d0f12', border: 'none', borderRadius: '6px', padding: '0.3rem 0.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' },
  applyRow: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' },
  dateGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  dateLabel: { fontSize: '0.75rem', color: 'var(--text-secondary)' },
  dateInput: { background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.4rem 0.6rem', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' },
  applyBtn: { background: 'var(--accent)', color: '#0d0f12', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', alignSelf: 'flex-end' },
};