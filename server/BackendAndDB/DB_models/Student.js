const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    rollNo: { type: String, required: true, unique: true }, // e.g., "CB.SC.U4CSE23001"
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // bcrypt hashed

    department: { type: String, required: true }, // e.g., "CSE"
    year: { type: Number, required: true },       // e.g., 3
    batchYear: { type: String, required: true },  // e.g., "23"

    // Section assignment derived from roll number ranges
    sectionLetter: { type: String, required: true }, // A, B, C, D, E, F
    sectionName: { type: String, required: true },   // e.g., "CSE A"

    // Reference to the Section model (for schedule queries)
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', default: null },

}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
