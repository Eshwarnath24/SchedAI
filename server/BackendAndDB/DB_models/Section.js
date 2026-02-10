const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Sec-A"
  year: { type: Number, required: true }, // 1, 2, 3, 4
  department: { type: String, required: true },
  studentCount: { type: Number, required: true }, // GA Constraint
  requiresAccess: { type: Boolean, default: false }, // GA Constraint (needs Lift/Ground floor)
  
  // The Curriculum: What courses must this section take?
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

module.exports = mongoose.model('Section', sectionSchema);