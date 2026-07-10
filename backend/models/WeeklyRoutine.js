const mongoose = require('mongoose');

const weeklyRoutineSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    routine: {
      monday: [String],
      tuesday: [String],
      wednesday: [String],
      thursday: [String],
      friday: [String],
      saturday: [String],
      sunday: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WeeklyRoutine', weeklyRoutineSchema);