import { useState } from 'react';
import Header from '../components/Header';
import ExercisePanel from '../components/ExercisePanel';
import { formatDate } from '../utils/dateUtils';
import Calendar from '../components/Calendar';
import StatsDashboard from '../components/StatsDashboard';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  return (
    <div style={styles.page}>
      <Header />
      <div style={styles.body}>
        <div style={styles.left}>
          <ExercisePanel selectedDate={selectedDate} />
        </div>
        <div style={styles.right}>
          <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
           <StatsDashboard />
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