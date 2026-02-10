const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  semester: { type: String, required: true }, // e.g., "Odd 2025"
  academicYear: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  fitnessScore: { type: Number }, // How good is this schedule?
  isActive: { type: Boolean, default: false }, // Is this the one currently displayed to users?

  // The Master Grid
  classes: [{
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    
    // We store both Index (for logic) and Details (for UI speed)
    slotIndex: { type: Number }, 
    day: { type: String },
    startTime: { type: String },
    endTime: { type: String }
  }]
});

module.exports = mongoose.model('Schedule', scheduleSchema);