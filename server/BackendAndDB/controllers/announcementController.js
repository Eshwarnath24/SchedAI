const Announcement            = require('../DB_models/announcement');
const eventEmitter            = require('../notifications/eventEmitter');
const ClassCancelledEvent     = require('../notifications/events/ClassCancelledEvent');
const SlotSwapRequestEvent    = require('../notifications/events/SlotSwapRequestEvent');
const AdminAnnouncementEvent  = require('../notifications/events/AdminAnnouncementEvent');

// =============================================================================
// NOVU INITIALIZATION (Lazy)
// @novu/node v2 renamed the env variable to NOVU_SECRET_KEY.
// We use a lazy getter so the Novu instance is created only when first needed,
// which prevents a startup crash if the env variable hasn't loaded yet.
// =============================================================================
const { Novu } = require('@novu/node');

let _novu = null;
const getNovu = () => {
    if (!_novu) {
        _novu = new Novu(process.env.NOVU_SECRET_KEY);
    }
    return _novu;
};

// =============================================================================
// HELPER — maps priority string → Novu payload importance label
// =============================================================================
const priorityLabel = { HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' };

// =============================================================================
// HELPER — safe Novu trigger wrapper
// Fires a Novu workflow but NEVER throws — a failed trigger logs a warning
// and is returned as `novuError` in the response instead of causing a 500.
// This means DB operations always succeed independently of Novu's status.
// =============================================================================
const safeNovuTrigger = async (workflowId, payload) => {
    try {
        await getNovu().trigger(workflowId, payload);
        return { ok: true };
    } catch (err) {
        // Log the full Novu error server-side for debugging
        console.warn(`[Novu] Trigger failed for workflow "${workflowId}":`, err?.message ?? err);
        return { ok: false, reason: err?.message ?? 'Novu trigger failed' };
    }
};

// =============================================================================
// CONTROLLER 1 — GET /api/announcements
// Fetches ALL persistent announcements from MongoDB.
// Sort order:  priorityWeight DESC  →  createdAt DESC  (newest high-priority first)
// =============================================================================
exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ priorityWeight: -1, createdAt: -1 });

        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        console.error('getAnnouncements Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// =============================================================================
// CONTROLLER 2 — POST /api/announcements/admin-cancel-event
//
// Use-case: An Admin cancels a class/lab due to a campus event.
// 1. Saves a persistent Announcement to MongoDB (shows on bulletin board).
// 2. Fires Novu workflow `global-alert` targeting Novu Topic `all-users`.
//
// Expected Request Body:
// {
//   "title"       : "Lab Closed",
//   "message"     : "Computer Lab B closed",
//   "sender"      : "Admin",            ← optional, defaults to 'Admin'
//   "priority"    : "HIGH",             ← 'HIGH' | 'MEDIUM' | 'LOW'
//   "eventDate"   : "2026-02-25",       ← injected into Novu template as {{eventDate}}
//   "eventReason" : "Power outage"      ← injected into Novu template as {{eventReason}}
// }
//
// Novu Template Variables for `global-alert`:
//   {{title}}, {{message}}, {{eventDate}}, {{eventReason}}, {{priority}}, {{sender}}
// =============================================================================
exports.adminCancelClassEvent = async (req, res) => {
    try {
        const {
            title,
            message,
            sender = 'Admin',
            priority = 'HIGH',
            eventDate,
            eventReason,
            // ── Email field for the Notification Module ──────────────────────
            // facultyEmails: array of faculty email addresses to notify via email.
            // Optional — if omitted, only DB save + Novu fire. Students never receive this.
            facultyEmails = [],
        } = req.body;

        // ── Validation ──────────────────────────────────────────────────────
        if (!title || !message) {
            return res.status(400).json({
                success: false,
                error: '`title` and `message` are required.'
            });
        }

        // ── 1. Save to MongoDB (always runs, independent of Novu) ────────────
        const newAnnouncement = new Announcement({
            title,
            message,
            sender,
            priority: priority.toUpperCase()
        });
        await newAnnouncement.save();

        // ── 2. Trigger Novu workflow (isolated — failure won't cause 500) ────
        // Make sure the topic 'all-users' has subscribers in your Novu dashboard.
        const novuResult = await safeNovuTrigger('global-alert', {
            to: [{ type: 'Topic', topicKey: 'all-users' }],
            payload: {
                title,
                message,
                eventDate: eventDate ?? 'N/A',
                eventReason: eventReason ?? 'N/A',
                priority: priorityLabel[priority.toUpperCase()] ?? 'HIGH',
                sender
            }
        });

        // ── Emit AdminAnnouncementEvent (Nodemailer / Notification Module) ───
        // Fire-and-forget — email delivery must never delay the HTTP response.
        // Only fires if at least one faculty email was provided.
        if (facultyEmails.length > 0) {
            eventEmitter.emit(
                AdminAnnouncementEvent.EVENT_NAME,
                new AdminAnnouncementEvent({
                    title,
                    message,
                    sender,
                    eventDate:   eventDate   ?? 'N/A',
                    eventReason: eventReason ?? 'N/A',
                    facultyEmails,
                })
            );
        }

        res.status(201).json({
            success: true,
            message: 'Announcement saved to bulletin board.',
            data: newAnnouncement,
            novu: novuResult.ok
                ? { sent: true }
                : { sent: false, warning: novuResult.reason }
        });
    } catch (error) {
        console.error('adminCancelClassEvent Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// =============================================================================
// CONTROLLER 3 — POST /api/announcements/faculty-cancel-class
//
// Use-case: A faculty member cancels a specific class session.
// ★ Does NOT save to the bulletin-board DB — transient alert only.
// 1. Fires `class-cancelled-student` (HIGH) → Topic `course:<courseId>:students`
// 2. Fires `class-cancelled-faculty` (LOW)  → cancelling faculty's subscriberId
//
// Expected Request Body:
// {
//   "facultySubscriberId" : "faculty_001",
//   "facultyName"         : "Dr. Smith",
//   "courseId"            : "CS301",
//   "courseName"          : "Data Structures",
//   "cancelDate"          : "2026-02-25",
//   "cancelReason"        : "Faculty ill"
// }
//
// Novu Template Variables for `class-cancelled-student`:
//   {{courseName}}, {{cancelDate}}, {{cancelReason}}, {{facultyName}}, {{priority}}
//
// Novu Template Variables for `class-cancelled-faculty`:
//   {{courseName}}, {{cancelDate}}, {{priority}}
// =============================================================================
exports.facultyCancelClass = async (req, res) => {
    try {
        const {
            facultySubscriberId,
            facultyName = 'Faculty',
            courseId,
            courseName,
            cancelDate,
            cancelReason = 'Not specified',
            // ── Email fields for the Notification Module ──────────────────────
            // facultyEmail   : the faculty's actual email address (for nodemailer)
            // studentEmails  : array of student email strings enrolled in this course
            //                  Pass [] if you don't have them — alerts will be skipped.
            facultyEmail   = null,
            studentEmails  = [],
        } = req.body;

        // ── Validation ──────────────────────────────────────────────────────
        if (!facultySubscriberId || !courseId || !courseName || !cancelDate) {
            return res.status(400).json({
                success: false,
                error: '`facultySubscriberId`, `courseId`, `courseName`, and `cancelDate` are required.'
            });
        }

        const studentTopicKey = `course:${courseId}:students`;

        // ── Trigger 1: Notify ALL students in this course (HIGH) ─────────────
        const studentResult = await safeNovuTrigger('class-cancelled-student', {
            to: [{ type: 'Topic', topicKey: studentTopicKey }],
            payload: { courseName, cancelDate, cancelReason, facultyName, priority: priorityLabel.HIGH }
        });

        // ── Trigger 2: Confirmation to the cancelling faculty (LOW) ──────────
        const facultyResult = await safeNovuTrigger('class-cancelled-faculty', {
            to: [{ subscriberId: facultySubscriberId }],
            payload: { courseName, cancelDate, priority: priorityLabel.LOW }
        });

        // ── Emit ClassCancelledEvent (Nodemailer / Notification Module) ────────
        // Fire-and-forget: do NOT await — email delivery must never delay the HTTP
        // response.  The NotificationListener handles errors internally.
        if (facultyEmail) {
            eventEmitter.emit(
                ClassCancelledEvent.EVENT_NAME,
                new ClassCancelledEvent({
                    facultyEmail,
                    facultyName,
                    courseCode:   courseId,
                    courseName,
                    cancelDate,
                    cancelReason,
                    studentEmails,
                })
            );
        }

        res.status(200).json({
            success: true,
            message: `Cancellation alerts dispatched.`,
            novu: {
                studentAlert: studentResult.ok ? { sent: true } : { sent: false, warning: studentResult.reason },
                facultyConfirmation: facultyResult.ok ? { sent: true } : { sent: false, warning: facultyResult.reason }
            }
        });
    } catch (error) {
        console.error('facultyCancelClass Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// =============================================================================
// CONTROLLER 4 — POST /api/announcements/request-slot-swap
//
// Use-case: A faculty member requests a slot swap with another faculty.
// ★ Does NOT save to DB — purely a Novu notification.
// Fires `slot-swap-request` (MEDIUM) → target faculty's subscriberId only.
//
// Expected Request Body:
// {
//   "requestingFacultyName"     : "Dr. Smith",
//   "targetFacultySubscriberId" : "faculty_002",
//   "currentSlot"               : "Monday 9AM",
//   "proposedSlot"              : "Tuesday 11AM",
//   "courseId"                  : "CS301",
//   "courseName"                : "Data Structures"
// }
//
// Novu Template Variables for `slot-swap-request`:
//   {{requestingFacultyName}}, {{currentSlot}}, {{proposedSlot}},
//   {{courseName}}, {{courseId}}, {{priority}}
// =============================================================================
exports.requestSlotSwap = async (req, res) => {
    try {
        const {
            requestingFacultyName,
            targetFacultySubscriberId,
            currentSlot,
            proposedSlot,
            courseId,
            courseName = 'N/A',
            // ── Email field for the Notification Module ──────────────────────
            // targetFacultyEmail: actual email address of the faculty receiving the swap request.
            // Optional — if omitted, only the Novu notification fires.
            targetFacultyEmail = null,
        } = req.body;

        // ── Validation ──────────────────────────────────────────────────────
        if (!requestingFacultyName || !targetFacultySubscriberId || !currentSlot || !proposedSlot) {
            return res.status(400).json({
                success: false,
                error: '`requestingFacultyName`, `targetFacultySubscriberId`, `currentSlot`, and `proposedSlot` are required.'
            });
        }

        // ── Trigger Novu workflow for target faculty only (MEDIUM) ────────────
        const novuResult = await safeNovuTrigger('slot-swap-request', {
            to: [{ subscriberId: targetFacultySubscriberId }],
            payload: {
                requestingFacultyName,
                currentSlot,
                proposedSlot,
                courseId: courseId ?? 'N/A',
                courseName,
                priority: priorityLabel.MEDIUM
            }
        });

        // ── Emit SlotSwapRequestEvent (Nodemailer / Notification Module) ──────
        // Fire-and-forget — email delivery must never delay the HTTP response.
        if (targetFacultyEmail) {
            eventEmitter.emit(
                SlotSwapRequestEvent.EVENT_NAME,
                new SlotSwapRequestEvent({
                    targetFacultyEmail,
                    requestingFacultyName,
                    currentSlot,
                    proposedSlot,
                    courseId:   courseId ?? 'N/A',
                    courseName,
                })
            );
        }

        res.status(200).json({
            success: true,
            message: `Slot swap request dispatched to '${targetFacultySubscriberId}'.`,
            novu: novuResult.ok
                ? { sent: true }
                : { sent: false, warning: novuResult.reason }
        });
    } catch (error) {
        console.error('requestSlotSwap Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
