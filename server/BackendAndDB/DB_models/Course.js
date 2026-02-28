const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g., "CS101"
  name: { type: String, required: true },               // e.g., "Data Structures"
  credits: { type: Number, required: true },

  // GA Constraints
  type: { type: String, enum: ['Theory', 'Lab', 'CIR'], required: true },
  duration: { type: Number, default: 1 }, // 1 = 1 hour, 3 = 3 hour block

  // CIR sub-type: Verbal, Technical, or Aptitude
  cirSubType: { type: String, enum: ['Verbal', 'Technical', 'Aptitude'], default: null },

  // Minimum weekly hours (60 hrs / 20 weeks = 3 hrs/week default)
  minWeeklyHours: { type: Number, default: 3 },
  semester: { type: Number, required: true },

  // Parallel Group: Courses with same group ID can be scheduled at same time
  parallelGroup: { type: String, default: null },

  department: { type: String, required: true },

  // Lab assistant assigned to this course (for Lab courses)
  labAssistant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});

module.exports = mongoose.model('Course', courseSchema);