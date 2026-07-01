const Day = require('../models/Day');

// GET a single day's exercises for the logged-in user
const getDay = async (req, res) => {
  try {
    const { date } = req.params;

    const day = await Day.findOne({ user: req.userId, date });

    if (!day) {
      return res.status(200).json({ date, exercises: [] });
    }

    res.status(200).json(day);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching day' });
  }
};

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Create/update a day's exercises (add, delete, reorder, toggle completion)
const updateDay = async (req, res) => {
  try {
    const { date } = req.params;
    const { exercises } = req.body;

    if (date < getTodayString()) {
      return res.status(403).json({ message: 'Cannot edit a past day' });
    }

    const day = await Day.findOneAndUpdate(
      { user: req.userId, date },
      { exercises },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(day);
  } catch (err) {
    res.status(500).json({ message: 'Error updating day' });
  }
};

const getDaysInRange = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    const days = await Day.find({
      user: req.userId,
      date: { $gte: start, $lte: end },
    });

    res.status(200).json(days);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching days' });
  }
};

module.exports = { getDay, updateDay, getDaysInRange };
const getStats = async (req, res) => {
  try {
    const days = await Day.find({ user: req.userId });

    const activeDays = days.filter(
      (d) => d.exercises.length > 0 && d.exercises.some((e) => e.completed)
    );
    const activeDates = activeDays.map((d) => d.date).sort();
    const activeSet = new Set(activeDates);

    let longestStreak = 0;
    let run = 0;
    let prevDate = null;
    activeDates.forEach((dateStr) => {
      const current = new Date(dateStr);
      if (prevDate) {
        const diffDays = Math.round((current - prevDate) / (1000 * 60 * 60 * 24));
        run = diffDays === 1 ? run + 1 : 1;
      } else {
        run = 1;
      }
      longestStreak = Math.max(longestStreak, run);
      prevDate = current;
    });

    let currentStreak = 0;
    const cursor = new Date();
    while (true) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      const dd = String(cursor.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dd}`;
      if (activeSet.has(dateStr)) {
        currentStreak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    const today = new Date();
    const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const dayOfMonth = today.getDate();
    const monthActiveDays = activeDates.filter((d) => d.startsWith(monthPrefix)).length;

    const monthDaysWithExercises = days.filter(
      (d) => d.date.startsWith(monthPrefix) && d.exercises.length > 0
    );
    let completionRate = 0;
    if (monthDaysWithExercises.length > 0) {
      const totalPercent = monthDaysWithExercises.reduce((sum, d) => {
        const completed = d.exercises.filter((e) => e.completed).length;
        return sum + (completed / d.exercises.length) * 100;
      }, 0);
      completionRate = Math.round(totalPercent / monthDaysWithExercises.length);
    }

    res.status(200).json({
      currentStreak,
      longestStreak,
      monthActiveDays,
      monthTotalDaysSoFar: dayOfMonth,
      completionRate,
      totalWorkouts: activeDates.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error computing stats' });
  }
};

module.exports = { getDay, updateDay, getDaysInRange, getStats };