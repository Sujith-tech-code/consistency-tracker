const WeeklyRoutine = require('../models/WeeklyRoutine');
const Day = require('../models/Day');

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRoutine = async (req, res) => {
  try {
    const routine = await WeeklyRoutine.findOne({ user: req.userId });
    if (!routine) {
      return res.status(200).json({
        routine: {
          monday: [], tuesday: [], wednesday: [], thursday: [],
          friday: [], saturday: [], sunday: [],
        },
      });
    }
    res.status(200).json({ routine: routine.routine });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching routine' });
  }
};

const saveRoutine = async (req, res) => {
  try {
    const { routine } = req.body;
    const updated = await WeeklyRoutine.findOneAndUpdate(
      { user: req.userId },
      { routine },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ routine: updated.routine });
  } catch (err) {
    res.status(500).json({ message: 'Error saving routine' });
  }
};

const applyRoutine = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const todayStr = getTodayString();

    const routine = await WeeklyRoutine.findOne({ user: req.userId });
    if (!routine) return res.status(404).json({ message: 'No routine found' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date(todayStr);

    const updates = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const cursorStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;

      if (cursorStr >= todayStr) {
        const dayName = DAYS[cursor.getDay()];
        const exerciseNames = routine.routine[dayName] || [];

        if (exerciseNames.length > 0) {
          const exercises = exerciseNames.map((name, idx) => ({
            name,
            completed: false,
            order: idx,
          }));

          updates.push(
            Day.findOneAndUpdate(
              { user: req.userId, date: cursorStr },
              { exercises },
              { new: true, upsert: true, setDefaultsOnInsert: true }
            )
          );
        }
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    await Promise.all(updates);
    res.status(200).json({ message: `Routine applied successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Error applying routine' });
  }
};

module.exports = { getRoutine, saveRoutine, applyRoutine };