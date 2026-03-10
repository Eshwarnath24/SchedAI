const mongoose = require('mongoose');

const facultyPreferenceSchema = new mongoose.Schema({
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    semesterCycle: {
        type: String,
        enum: ['odd', 'even'],
        required: true
    },
    preferences: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true
        },
        semester: {
            type: Number,
            required: true
        },
        priority: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// One preference document per faculty per semester cycle
facultyPreferenceSchema.index({ faculty: 1, semesterCycle: 1 }, { unique: true });

module.exports = mongoose.model('FacultyPreference', facultyPreferenceSchema);
