import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axiosInstance from '../api/axiosInstance';
import { isToday, isPast } from '../utils/dateUtils';
import Spinner from './Spinner';
import Confetti from './Confetti';
import ProgressRing from './ProgressRing';

export default function ExercisePanel({ selectedDate, onToggle }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [celebrated, setCelebrated] = useState(false);

  const past = isPast(selectedDate);
  const today = isToday(selectedDate);
  const canEdit = !past;

  useEffect(() => {
    setEditMode(false);
    setCelebrated(false);
    const fetchDay = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get(`/days/${selectedDate}`);
        setExercises(res.data.exercises || []);
      } catch {
        setError('Failed to load exercises. Check your connection.');
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDay();
  }, [selectedDate]);

  const checkCelebration = (list) => {
    if (list.length > 0 && list.every((ex) => ex.completed) && !celebrated) {
      setCelebrated(true);
      setTimeout(() => setCelebrated(false), 3000);
    }
  };

  const saveExercises = async (updatedList) => {
    setSaving(true);
    try {
      await axiosInstance.put(`/days/${selectedDate}`, { exercises: updatedList });
    } catch {
      setError('Failed to save. Check your connection.');
    } finally {
      setSaving(false);
    }
  };

const handleToggle = (id) => {
  const updated = exercises.map((ex) =>
    (ex._id || ex.tempId) === id ? { ...ex, completed: !ex.completed } : ex
  );
  setExercises(updated);
  checkCelebration(updated);
  saveExercises(updated);
  if (onToggle) onToggle(selectedDate, updated);
};
const handleAdd = () => {
  if (!newName.trim()) return;
  const updated = [
    ...exercises,
    { name: newName.trim(), completed: false, order: exercises.length, tempId: Date.now() },
  ];
  setExercises(updated);
  setNewName('');
  saveExercises(updated);
  if (onToggle) onToggle(selectedDate, updated);
};

const handleDelete = (id) => {
  const updated = exercises
    .filter((ex) => (ex._id || ex.tempId) !== id)
    .map((ex, idx) => ({ ...ex, order: idx }));
  setExercises(updated);
  saveExercises(updated);
  if (onToggle) onToggle(selectedDate, updated);
};

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(exercises);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const withOrder = reordered.map((ex, idx) => ({ ...ex, order: idx }));
    setExercises(withOrder);
    saveExercises(withOrder);
  };

  const sorted = [...exercises].sort((a, b) => a.order - b.order);
  const completedCount = exercises.filter((e) => e.completed).length;
  const allDone = exercises.length > 0 && completedCount === exercises.length;

  return (
    <div style={styles.panel}>
      {celebrated && <Confetti />}

    <div style={styles.headerRow}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
    <ProgressRing completed={completedCount} total={exercises.length} size={54} />
    <div>
      <h3 style={styles.dateLabel}>{today ? 'Today' : selectedDate}</h3>
      {exercises.length > 0 && (
        <motion.p
          key={`${completedCount}/${exercises.length}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...styles.progressText,
            color: allDone ? 'var(--accent)' : 'var(--text-secondary)',
          }}
        >
          {allDone ? '🎉 All done!' : `${completedCount}/${exercises.length} completed`}
        </motion.p>
      )}
    </div>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    {saving && <Spinner size={14} />}
    {canEdit && (
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => setEditMode(!editMode)}
        style={styles.editBtn}
      >
        {editMode ? 'Done' : 'Edit'}
      </motion.button>
    )}
  </div>
</div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.errorText}>
          {error}
        </motion.p>
      )}

      {loading ? (
        <div style={styles.centered}>
          <Spinner size={28} />
        </div>
      ) : sorted.length === 0 && !editMode ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.emptyState}>
          {past ? null : <p>Add exercises for this day</p>}
        </motion.div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="exercise-list" isDropDisabled={!editMode}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <AnimatePresence>
                  {sorted.map((ex, index) => {
                    const id = ex._id || ex.tempId;
                    return (
                      <Draggable key={String(id)} draggableId={String(id)} index={index} isDragDisabled={!editMode}>
                        {(dragProvided, snapshot) => (
                          <motion.div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            style={{
                              ...styles.exerciseRow,
                              ...dragProvided.draggableProps.style,
                              background: snapshot.isDragging ? 'var(--bg-input)' : 'transparent',
                            }}
                          >
                            {editMode && (
                              <span {...dragProvided.dragHandleProps} style={styles.dragHandle}>⠿</span>
                            )}
                            <motion.div
                              whileTap={{ scale: 0.85 }}
                              animate={ex.completed ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                            >
                              <input
                                type="checkbox"
                                checked={ex.completed}
                                disabled={past || saving}
                                onChange={() => handleToggle(id)}
                                style={styles.checkbox}
                              />
                            </motion.div>
                            <motion.span
                              key={String(ex.completed)}
                              initial={{ opacity: 0.4 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.25 }}
                              style={ex.completed ? styles.completedText : styles.exerciseText}
                            >
                              {ex.name}
                            </motion.span>
                            {editMode && (
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(id)}
                                style={styles.deleteBtn}
                              >✕</motion.button>
                            )}
                          </motion.div>
                        )}
                      </Draggable>
                    );
                  })}
                </AnimatePresence>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {editMode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.addRow}>
          <input
            type="text"
            placeholder="New exercise..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            style={styles.addInput}
          />
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleAdd}
            disabled={saving}
            style={{ ...styles.addBtn, opacity: saving ? 0.6 : 1 }}
          >
            {saving ? <Spinner size={14} color="#0d0f12" /> : 'Add'}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

const styles = {
  panel: { background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1.25rem', height: '100%' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  dateLabel: { margin: 0, fontSize: '1.1rem', fontWeight: 600 },
  progressText: { margin: '0.2rem 0 0 0', fontSize: '0.8rem' },
  editBtn: { background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.8rem', cursor: 'pointer' },
  centered: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' },
  errorText: { color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '0.75rem' },
  emptyState: { color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' },
  exerciseRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.25rem', borderBottom: '1px solid var(--border-color)', borderRadius: '6px' },
  dragHandle: { cursor: 'grab', color: 'var(--text-secondary)' },
  checkbox: { accentColor: 'var(--accent)', width: '16px', height: '16px', cursor: 'pointer' },
  exerciseText: { flex: 1 },
  completedText: { flex: 1, color: 'var(--accent)', fontWeight: 600 },
  deleteBtn: { background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.9rem' },
  addRow: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  addInput: { flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' },
  addBtn: { background: 'var(--accent)', color: '#0d0f12', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '52px' },
};