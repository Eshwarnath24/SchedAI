const mongoose = require('mongoose');

const scheduleOverrideSchema = new mongoose.Schema({
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },

    // Original class location
    day: { type: String, required: true },         // e.g. "Monday"
    slotIndex: { type: Number, required: true },    // Frontend slot ID

    // Course info (denormalized for fast grid merging)
    courseCode: { type: String, required: true },
    courseName: { type: String, required: true },

    // Override type
    type: {
        type: String,
        enum: ['CANCELLED', 'RESCHEDULED'],
        required: true
    },

    scope: {
        type: String,
        enum: ['Today', 'Complete Sem'],
        default: 'Today'
    },

    reason: { type: String, default: 'Faculty unavailable' },

    // For RESCHEDULED: where the class moves to
    newDay: { type: String, default: null },
    newSlotIndex: { type: Number, default: null },
    newRoom: { type: String, default: null },

    // Date bounds — override is active when now >= fromDate AND now <= toDate
    fromDate: { type: Date, required: true },
    toDate: { type: Date, default: null },  // null = end of semester

    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for efficient queries
scheduleOverrideSchema.index({ section: 1, isActive: 1, fromDate: 1, toDate: 1 });
scheduleOverrideSchema.index({ faculty: 1, isActive: 1 });

module.exports = mongoose.model('ScheduleOverride', scheduleOverrideSchema);
