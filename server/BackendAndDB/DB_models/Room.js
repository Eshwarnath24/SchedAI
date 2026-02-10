const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "N-101"
  building: { type: String, required: true },           // e.g., "North Block"
  capacity: { type: Number, required: true },           // GA Constraint: Must > Section Size
  type: { 
    type: String, 
    enum: ['Lecture', 'Lab', 'Seminar Hall'], 
    required: true 
  }, 
  isAccessible: { type: Boolean, default: false },       // GA Constraint: For disabled sections
  resources: [{ type: String }] // e.g., ["Projector", "Computers"]
});

module.exports = mongoose.model('Room', roomSchema);