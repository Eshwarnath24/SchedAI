const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  day: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true 
  },
  startTime: { type: String, required: true }, // e.g., "09:00"
  endTime: { type: String, required: true },   // e.g., "10:00"
  slotIndex: { type: Number, required: true, unique: true }, // 1 to 60 (Crucial for GA)
  isBreak: { type: Boolean, default: false },  // e.g., Lunch
  type: { type: String, enum: ['Theory', 'Lab'], default: 'Theory' } // Some slots might be Lab-only
});

module.exports = mongoose.model('TimeSlot', timeSlotSchema);