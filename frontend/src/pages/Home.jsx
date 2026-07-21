import { useState } from 'react';
import Header from '../components/Header';
import ExercisePanel from '../components/ExercisePanel';
import { formatDate } from '../utils/dateUtils';
import Calendar from '../components/Calendar';
import StatsDashboard from '../components/StatsDashboard';
import WeeklyRoutineWidget from '../components/WeeklyRoutineWidget';
import RoutineDrawer from '../components/RoutineDrawer';
import { motion } from 'framer-motion';

const isMobile = window.innerWidth <= 768;

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [calendarKey, setCalendarKey] = useState(0);
  const [statsKey, setStatsKey] = useState(0);
  const [dayOverrides, setDayOverrides] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRoutineApplied = () => {
    setCalendarKey((k) => k + 1);
    setStatsKey((k) => k + 1);
  };

  const handleExerciseToggled = (dateStr, updatedExercises) => {
    setDayOverrides((prev) => ({ ...prev, [dateStr]: updatedExercises }));
    setStatsKey((k) => k + 1);
  };

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <div style={styles.page}>
        <Header />
        <div style={styles.mobileBody}>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setDrawerOpen(true)}
            style={styles.setRoutineBtn}
          >
            📋 Set Weekly Routine
          </motion.button>
          <ExercisePanel
            key={selectedDate}
            selectedDate={selectedDate}
            onToggle={handleExerciseToggled}
          />
         <Calendar
  key={`cal-${calendarKey}`}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            dayOverrides={dayOverrides}
            monthsToShow={1}
          />
          <StatsDashboard key={`stats-${statsKey}`} />
        </div>
        <RoutineDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onRoutineApplied={handleRoutineApplied}
        />
      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div style={styles.page}>
      <Header />
      <WeeklyRoutineWidget onRoutineApplied={handleRoutineApplied} />
      <div style={styles.body}>
        <div style={styles.left}>
          <ExercisePanel
            key={selectedDate}
            selectedDate={selectedDate}
            onToggle={handleExerciseToggled}
          />
        </div>
        <div style={styles.right}>
          <Calendar
  key={`cal-${calendarKey}`}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            dayOverrides={dayOverrides}
          />
          <StatsDashboard key={`stats-${statsKey}`} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  body: { display: 'flex', flex: 1, gap: '1rem', padding: '1.5rem', alignItems: 'stretch' },
  left: { flex: '0 0 30%', minWidth: '280px' },
  right: { flex: '1', display: 'flex', flexDirection: 'column' },
  mobileBody: { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' },
  setRoutineBtn: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--accent)',
    color: 'var(--accent)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
};