const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true }, // e.g., "Grade OS Lab Reports"
  isCompleted: { type: Boolean, default: false },
  dueDate: { type: Date }
});

module.exports = mongoose.model('Task', taskSchema);