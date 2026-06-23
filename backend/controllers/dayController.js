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