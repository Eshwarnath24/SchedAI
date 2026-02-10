const LeaveRequest = require('../DB_models/leaveRequest');

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * 1. Strict Date Validator
 * Prevents "Feb 30" -> "Mar 2" auto-correction.
 * Ensures the date strictly exists in the calendar.
 * Expects YYYY-MM-DD string.
 */
const isValidDate = (dateString) => {
    // 1. Regex check for format YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    // 2. JS Date check
    // We append 'T00:00:00Z' ensure we are checking against UTC date
    // (Date.parse('YYYY-MM-DD') defaults to UTC but new Date() is safer with explicit time)
    // However, to check existence, we can parse the parts manually.

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed

    // Check if the Date object matches the input parts
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() + 1 !== month ||
        date.getUTCDate() !== day
    ) {
        return false;
    }

    return true;
};

/**
 * 2. Overlap Checker (The "Inception" Bug Fix)
 * Uses standard range intersection logic: (StartA < EndB) && (EndA > StartB)
 * This covers all cases: overlapping start, overlapping end, enclosing, enclosed.
 */
const checkOverlap = async (facultyId, newStart, newEnd) => {
    // Determine if any existing leave overlaps
    const conflict = await LeaveRequest.findOne({
        faculty: facultyId,
        status: { $ne: 'Rejected' }, // Ignore rejected requests
        // INTERSECTION QUERY:
        // Existing Leave Start < New Request End
        // AND
        // Existing Leave End > New Request Start
        fromDate: { $lt: newEnd },
        toDate: { $gt: newStart }
    });

    return !!conflict;
};

// =================================================================
// EXPORTED CONTROLLERS
// =================================================================

// 1. Apply for Full Day Leave
// Input: { facultyId, fromDate, toDate, message }
exports.applyFullDayLeave = async (req, res) => {
    try {
        const { facultyId, fromDate, toDate, message } = req.body;

        // A. VALIDATION: Strict Date Format
        if (!isValidDate(fromDate) || !isValidDate(toDate)) {
            return res.status(400).json({
                success: false,
                error: "Invalid Date(s). Dates must be in YYYY-MM-DD format and exist (e.g., no Feb 30)."
            });
        }

        // B. CONSTRUCT UTCTime Ranges
        // Full Day starts at 00:00:00.000Z and ends at 23:59:59.999Z
        const start = new Date(`${fromDate}T00:00:00.000Z`);
        const end = new Date(`${toDate}T23:59:59.999Z`);

        // C. VALIDATION: Logical (Time Traveler)
        if (start > end) {
            return res.status(400).json({ success: false, error: "From Date cannot be after To Date." });
        }

        // D. VALIDATION: Past Dates (Time Machine)
        const now = new Date();
        const todayStart = new Date(now.toISOString().split('T')[0] + 'T00:00:00.000Z');

        if (start < todayStart) {
            return res.status(400).json({ success: false, error: "Cannot apply for past dates." });
        }

        // E. VALIDATION: Conflict Detection
        if (await checkOverlap(facultyId, start, end)) {
            return res.status(409).json({ success: false, error: "Conflict: You already have a leave or slot booked during this period." });
        }

        // F. SAVE
        const newLeave = new LeaveRequest({
            faculty: facultyId,
            fromDate: start,
            toDate: end,
            reason: message,
            type: 'Casual', // Default for full day
            status: 'Pending'
        });

        await newLeave.save();
        res.status(201).json({ success: true, message: 'Full Day Leave applied successfully', data: newLeave });

    } catch (error) {
        console.error("ApplyFullDayLeave Error:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

// 2. Apply for Slot Unavailability
// Input: { facultyId, date, startTime, endTime, message }
exports.applySlotLeave = async (req, res) => {
    try {
        const { facultyId, date, startTime, endTime, message } = req.body;

        // A. VALIDATION: Strict Date Format
        if (!isValidDate(date)) {
            return res.status(400).json({ success: false, error: "Invalid Date." });
        }

        // Validate Time Format (HH:mm) basic regex
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            return res.status(400).json({ success: false, error: "Invalid Time format. Use HH:mm." });
        }

        // B. CONSTRUCT UTC Date Objects
        // "2026-02-09T10:00:00Z"
        const startDateTime = new Date(`${date}T${startTime}:00.000Z`);
        const endDateTime = new Date(`${date}T${endTime}:00.000Z`);

        // C. VALIDATION: Logical (Time Traveler + 0 duration)
        if (startDateTime >= endDateTime) {
            return res.status(400).json({ success: false, error: "Start time must be strictly before End time." });
        }

        // D. VALIDATION: Past Dates/Times
        // Strict check: you cannot book a slot that has already passed this very second
        if (startDateTime < new Date()) {
            return res.status(400).json({ success: false, error: "Cannot book slots in the past." });
        }

        // E. VALIDATION: Conflict Detection
        if (await checkOverlap(facultyId, startDateTime, endDateTime)) {
            return res.status(409).json({ success: false, error: "Conflict: This slot overlaps with an existing leave or slot." });
        }

        // F. SAVE
        const newSlot = new LeaveRequest({
            faculty: facultyId,
            fromDate: startDateTime,
            toDate: endDateTime,
            reason: message,
            type: 'Duty', // Using 'Duty' for Slots
            status: 'Approved'
        });

        await newSlot.save();
        res.status(201).json({ success: true, message: 'Slot Unavailability marked successfully', data: newSlot });

    } catch (error) {
        console.error("ApplySlotLeave Error:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

// 3. Get History
// Separates 'Duty' (Slots) from 'Casual'/'Sick' (Full Day)
exports.getHistory = async (req, res) => {
    try {
        // If sorting not working in frontend, we sort here.
        const { facultyId } = req.params;

        const allRequests = await LeaveRequest.find({ faculty: facultyId })
            .sort({ createdAt: -1 }); // Newest first

        const leaveHistory = [];
        const slotHistory = [];

        allRequests.forEach(req => {
            if (req.type === 'Duty') {
                slotHistory.push(req);
            } else {
                leaveHistory.push(req);
            }
        });

        res.status(200).json({ leaveHistory, slotHistory });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};