const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g., "CS101"
  name: { type: String, required: true },               // e.g., "Data Structures"
  credits: { type: Number, required: true },
  
  // GA Constraints
  type: { type: String, enum: ['Theory', 'Lab'], required: true },
  duration: { type: Number, default: 1 }, // 1 = 1 hour, 3 = 3 hour block
  semester: { type: Number, required: true },
  
  // Parallel Group: Courses with same group ID can be scheduled at same time
  parallelGroup: { type: String, default: null }, 
  
  department: { type: String, required: true }
});

module.exports = mongoose.model('Course', courseSchema);