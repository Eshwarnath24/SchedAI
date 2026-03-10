const ScheduleOverride = require('../DB_models/ScheduleOverride');

// =================================================================
// 1. POST /api/schedule/override — Create an override
// =================================================================
exports.createOverride = async (req, res) => {
    try {
        const {
            facultyId,
            sectionId,
            day,
            slotIndex,
            courseCode,
            courseName,
            type,        // 'CANCELLED' or 'RESCHEDULED'
            scope,       // 'Today' or 'Complete Sem' (only used for RESCHEDULED)
            reason,
            newDay,      // For RESCHEDULED
            newSlotIndex,// For RESCHEDULED
            newRoom,     // For RESCHEDULED
            slotEndTime, // For CANCELLED — e.g. "08:50" — override expires after this time
        } = req.body;

        // Validation
        if (!facultyId || !sectionId || !day || slotIndex == null || !courseCode || !courseName || !type) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: facultyId, sectionId, day, slotIndex, courseCode, courseName, type'
            });
        }

        if (type === 'RESCHEDULED' && (!newDay || newSlotIndex == null)) {
            return res.status(400).json({
                success: false,
                error: 'RESCHEDULED overrides require newDay and newSlotIndex'
            });
        }

        // Determine date bounds (IST = UTC+5:30)
        const now = new Date();
        const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
        const nowIST = new Date(now.getTime() + IST_OFFSET_MS);
        const todayIST = nowIST.toISOString().split('T')[0];
        let fromDate, toDate;

        if (scope === 'Complete Sem') {
            // Permanent until manually restored
            fromDate = new Date(`${todayIST}T00:00:00.000+05:30`);
            toDate = null;
        } else {
            // Expires at end of this week (Sunday 23:59:59 IST)
            fromDate = new Date(`${todayIST}T00:00:00.000+05:30`);
            const dayOfWeek = nowIST.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
            const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
            const sundayIST = new Date(nowIST.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000);
            const sundayDate = sundayIST.toISOString().split('T')[0];
            toDate = new Date(`${sundayDate}T23:59:59.999+05:30`);
        }

        // Check for existing active override on same slot
        const existing = await ScheduleOverride.findOne({
            faculty: facultyId,
            section: sectionId,
            day,
            slotIndex,
            isActive: true,
            $or: [
                { toDate: null },  // No end date
                { toDate: { $gte: now } }  // End date in the future
            ]
        });

        if (existing) {
            // Update existing override instead of creating duplicate
            existing.type = type;
            existing.scope = scope || 'Today';
            existing.reason = reason || existing.reason;
            existing.newDay = newDay || null;
            existing.newSlotIndex = newSlotIndex != null ? newSlotIndex : null;
            existing.newRoom = newRoom || null;
            existing.fromDate = fromDate;
            existing.toDate = toDate;
            await existing.save();

            return res.status(200).json({
                success: true,
                message: 'Override updated',
                data: existing
            });
        }

        // Create new override
        const override = await ScheduleOverride.create({
            faculty: facultyId,
            section: sectionId,
            day,
            slotIndex,
            courseCode,
            courseName,
            type,
            scope: scope || 'Today',
            reason: reason || 'Faculty unavailable',
            newDay: newDay || null,
            newSlotIndex: newSlotIndex != null ? newSlotIndex : null,
            newRoom: newRoom || null,
            fromDate,
            toDate,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: `${type} override created`,
            data: override
        });

    } catch (err) {
        console.error('❌ createOverride error:', err);
        res.status(500).json({ success: false, error: 'Server error creating override.' });
    }
};

// =================================================================
// 2. GET /api/schedule/overrides/section/:sectionId — Active overrides
// =================================================================
exports.getOverridesForSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const now = new Date();

        const overrides = await ScheduleOverride.find({
            section: sectionId,
            isActive: true,
            fromDate: { $lte: now },
            $or: [
                { toDate: null },        // No end date (full semester)
                { toDate: { $gte: now } } // End date hasn't passed
            ]
        }).populate('faculty', 'name email');

        res.json({ success: true, overrides });

    } catch (err) {
        console.error('❌ getOverridesForSection error:', err);
        res.status(500).json({ success: false, error: 'Server error fetching overrides.' });
    }
};

// =================================================================
// 3. DELETE /api/schedule/override/:id — Remove (restore class)
// =================================================================
exports.deleteOverride = async (req, res) => {
    try {
        const { id } = req.params;

        const override = await ScheduleOverride.findById(id);
        if (!override) {
            return res.status(404).json({ success: false, error: 'Override not found.' });
        }

        // Soft delete: mark as inactive
        override.isActive = false;
        await override.save();

        res.json({
            success: true,
            message: 'Override removed. Class restored to original schedule.'
        });

    } catch (err) {
        console.error('❌ deleteOverride error:', err);
        res.status(500).json({ success: false, error: 'Server error deleting override.' });
    }
};

// =================================================================
// 4. Helper — Get active overrides (used by scheduleApiController)
// =================================================================
exports.getActiveOverrides = async (filter) => {
    const now = new Date();
    return ScheduleOverride.find({
        ...filter,
        isActive: true,
        fromDate: { $lte: now },
        $or: [
            { toDate: null },
            { toDate: { $gte: now } }
        ]
    });
};
