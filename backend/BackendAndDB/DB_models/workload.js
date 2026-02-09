const mongoose = require('mongoose');

const workloadSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  
  // Real-time stats for the dashboard
  totalClassesScheduled: { type: Number, default: 0 },
  classesCompleted: { type: Number, default: 0 },
  syllabusProgress: { type: Number, default: 0 }, // Percentage (0-100)
  studentAttendanceAvg: { type: Number, default: 0 }
});

module.exports = mongoose.model('Workload', workloadSchema);