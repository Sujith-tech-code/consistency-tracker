import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { formatDate } from '../utils/dateUtils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const VISIBLE_COUNT = 4; // how many months shown at once

function shiftMonth(year, month, delta) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

function getMonthCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const getColor = (completed, total) => {
  if (!total || completed === 0) return 'var(--bg-input)';
  const ratio = completed / total;
  const start = [20, 83, 45];   // very dark green — clearly green but almost black
  const end = [34, 197, 94];    // bright accent green (#22c55e) — matches the consistency bar
  const r = Math.round(start[0] + (end[0] - start[0]) * ratio);
  const g = Math.round(start[1] + (end[1] - start[1]) * ratio);
  const b = Math.round(start[2] + (end[2] - start[2]) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
};

export default function Calendar({ selectedDate, onSelectDate }) {
  const today = new Date();
  const todayStr = formatDate(today);

  // anchorOffset = how many months away from "today's month" the window starts
  const [anchorOffset, setAnchorOffset] = useState(-1); // start showing 1 month back
  const [daysData, setDaysData] = useState({});
const [calendarLoading, setCalendarLoading] = useState(false);
const [calendarError, setCalendarError] = useState('');
  const months = [];
  for (let i = 0; i < VISIBLE_COUNT; i++) {
    months.push(shiftMonth(today.getFullYear(), today.getMonth(), anchorOffset + i));
  }

useEffect(() => {
  const fetchAll = async () => {
    setCalendarLoading(true);
    setCalendarError('');
    const first = months[0];
    const last = months[months.length - 1];
    const start = formatDate(new Date(first.year, first.month, 1));
    const end = formatDate(new Date(last.year, last.month + 1, 0));
    try {
      const res = await axiosInstance.get('/days', { params: { start, end } });
      const map = {};
      res.data.forEach((d) => { map[d.date] = d.exercises; });
      setDaysData(map);
    } catch {
      setCalendarError('Could not load activity data.');
    } finally {
      setCalendarLoading(false);
    }
  };
  fetchAll();
}, [anchorOffset]);

  const goPrev = () => setAnchorOffset((prev) => prev - 1);
  const goNext = () => setAnchorOffset((prev) => prev + 1);

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>Activity</h3>
        <div style={styles.arrowGroup}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={goPrev} style={styles.navBtn}>←</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={goNext} style={styles.navBtn}>→</motion.button>
        </div>
      </div>
      {calendarError && (
  <p style={{ color: 'var(--danger)', fontSize: '0.8rem', margin: '0 0 0.75rem 0' }}>
    {calendarError}
  </p>
)}

      <AnimatePresence mode="wait">
        <motion.div
          key={anchorOffset}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          style={styles.monthsRow}
        >
          {months.map(({ year, month }) => {
            const cells = getMonthCells(year, month);
            const label = new Date(year, month, 1).toLocaleString('default', { month: 'short', year: 'numeric' });

            return (
              <div key={`${year}-${month}`} style={styles.monthBlock}>
                <div style={styles.monthLabel}>{label}</div>
                <div style={styles.weekdayRow}>
                  {WEEKDAYS.map((w) => <div key={w} style={styles.weekdayCell}>{w[0]}</div>)}
                </div>
                <div style={styles.monthGrid}>
                  {cells.map((date, idx) => {
                    if (!date) return <div key={idx} style={styles.emptyCell} />;
                    const dateStr = formatDate(date);
                    const exercises = daysData[dateStr] || [];
                    const total = exercises.length;
                    const completed = exercises.filter((e) => e.completed).length;
                    const bg = getColor(completed, total);
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;
                    const darkText = bg !== 'var(--bg-input)';

                    return (
                      <motion.div
  key={idx}
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.92 }}
  animate={calendarLoading ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
  transition={calendarLoading ? { duration: 1, repeat: Infinity } : {}}
  onClick={() => onSelectDate(dateStr)}
                        style={{
                          ...styles.dayCell,
                          background: bg,
                          color: darkText ? '#0d0f12' : 'var(--text-primary)',
                          outline: isSelected ? '2px solid var(--accent)' : isToday ? '1px solid var(--text-secondary)' : 'none',
                        }}
                      >
                        {date.getDate()}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const styles = {
  wrapper: { background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.5rem' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: 600 },
  arrowGroup: { display: 'flex', gap: '0.5rem' },
  navBtn: { background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '1rem' },
 monthsRow: { display: 'flex', gap: '16px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '0.5rem', width: '100%' },
monthBlock: { flexShrink: 0, minWidth: '228px' },
monthLabel: { fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.6rem' },
weekdayRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 28px)', gap: '4px', marginBottom: '5px' },
weekdayCell: { textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-secondary)' },
monthGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 28px)', gridAutoRows: '28px', gap: '4px' },
emptyCell: { width: '28px', height: '28px' },
dayCell: { width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.25s ease' },
}