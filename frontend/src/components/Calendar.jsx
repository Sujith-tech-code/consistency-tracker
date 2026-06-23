import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import { formatDate } from '../utils/dateUtils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_BACK = 1;
const MONTHS_FORWARD = 2;

function buildMonthsList() {
  const today = new Date();
  const months = [];
  for (let i = -MONTHS_BACK; i <= MONTHS_FORWARD; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return months;
}

function getMonthCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay(); // 0 = Sun, matches our Sun-start columns directly

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const getColor = (completed, total) => {
  if (!total || completed === 0) return 'var(--bg-input)';
  const ratio = completed / total;
  const start = [22, 101, 52];
  const end = [187, 247, 208];
  const r = Math.round(start[0] + (end[0] - start[0]) * ratio);
  const g = Math.round(start[1] + (end[1] - start[1]) * ratio);
  const b = Math.round(start[2] + (end[2] - start[2]) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
};

export default function Calendar({ selectedDate, onSelectDate }) {
  const [months] = useState(buildMonthsList);
  const [daysData, setDaysData] = useState({});
  const scrollRef = useRef(null);
  const todayStr = formatDate(new Date());
  const today = new Date();

  useEffect(() => {
    const fetchAll = async () => {
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
        setDaysData({});
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const el = scrollRef.current?.querySelector('[data-current-month="true"]');
    if (el) el.scrollIntoView({ inline: 'start', block: 'nearest' });
  }, []);

  const scrollByMonth = (dir) => {
    if (!scrollRef.current) return;
    const block = scrollRef.current.querySelector('.month-block');
    const blockWidth = block ? block.offsetWidth : 260;
    scrollRef.current.scrollBy({ left: dir * (blockWidth + 24), behavior: 'smooth' });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>Activity</h3>
        <div style={styles.arrowGroup}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => scrollByMonth(-1)} style={styles.navBtn}>←</motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => scrollByMonth(1)} style={styles.navBtn}>→</motion.button>
        </div>
      </div>

      <div ref={scrollRef} style={styles.scrollContainer}>
        <div style={styles.monthsRow}>
          {months.map(({ year, month }) => {
            const cells = getMonthCells(year, month);
            const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
            const label = new Date(year, month, 1).toLocaleString('default', { month: 'short', year: 'numeric' });

            return (
              <div
                key={`${year}-${month}`}
                className="month-block"
                data-current-month={isCurrentMonth ? 'true' : undefined}
                style={styles.monthBlock}
              >
                <div style={styles.monthLabel}>{label}</div>
                <div style={styles.weekdayRow}>
                  {WEEKDAYS.map((w) => (
                    <div key={w} style={styles.weekdayCell}>{w[0]}</div>
                  ))}
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
                        onClick={() => onSelectDate(dateStr)}
                        style={{
                          ...styles.dayCell,
                          background: bg,
                          color: darkText ? '#0d0f12' : 'var(--text-primary)',
                          outline: isSelected
                            ? '2px solid var(--accent)'
                            : isToday
                            ? '1px solid var(--text-secondary)'
                            : 'none',
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
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '1.25rem',
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  title: { margin: 0, fontSize: '1.1rem', fontWeight: 600 },
  arrowGroup: { display: 'flex', gap: '0.5rem' },
  navBtn: {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    padding: '0.3rem 0.7rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  scrollContainer: { overflowX: 'auto', paddingBottom: '0.5rem' },
  monthsRow: { display: 'flex', gap: '24px' },
  monthBlock: { flexShrink: 0 },
  monthLabel: { fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' },
  weekdayRow: { display: 'grid', gridTemplateColumns: 'repeat(7, 30px)', gap: '4px', marginBottom: '4px' },
  weekdayCell: { textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-secondary)' },
  monthGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 30px)', gridAutoRows: '30px', gap: '4px' },
  emptyCell: { width: '30px', height: '30px' },
  dayCell: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.25s ease',
  },
};