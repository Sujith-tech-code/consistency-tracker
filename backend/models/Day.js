const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

const daySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // stored as 'YYYY-MM-DD'
    exercises: [exerciseSchema],
  },
  { timestamps: true }
);

daySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Day', daySchema);