import { useState } from 'react';
import Header from '../components/Header';
import ExercisePanel from '../components/ExercisePanel';
import { formatDate } from '../utils/dateUtils';
import Calendar from '../components/Calendar';
import StatsDashboard from '../components/StatsDashboard';
import WeeklyRoutineWidget from '../components/WeeklyRoutineWidget';


export default function Home() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
const [calendarKey, setCalendarKey] = useState(0);
const [statsKey, setStatsKey] = useState(0);
const [dayOverrides, setDayOverrides] = useState({});

const handleRoutineApplied = () => {
  setCalendarKey((k) => k + 1);
  setStatsKey((k) => k + 1);
};
const handleExerciseToggled = (dateStr, updatedExercises) => {
  setDayOverrides((prev) => ({ ...prev, [dateStr]: updatedExercises }));
  setStatsKey((k) => k + 1);
};
  return (
<div style={styles.page}>
  <Header />
  <WeeklyRoutineWidget onRoutineApplied={handleRoutineApplied} />
  <div style={styles.body}>
    <div style={styles.left}>
     <ExercisePanel key={selectedDate} selectedDate={selectedDate} onToggle={handleExerciseToggled} />
    </div>
    <div style={styles.right}>
     <Calendar key={calendarKey} selectedDate={selectedDate} onSelectDate={setSelectedDate} dayOverrides={dayOverrides} />
     <StatsDashboard key={statsKey} />
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
  calendarPlaceholder: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
  },
};