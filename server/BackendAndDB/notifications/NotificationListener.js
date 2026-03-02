/**
 * notifications/NotificationListener.js
 *
 * Mirrors a NestJS @Injectable() class decorated with @OnEvent() handlers.
 *
 * Responsibilities:
 *  • Listening to "class.cancelled"    → CONFIRMATION email to faculty
 *                                      → CLASS CANCELLED ALERT to each student
 *  • Listening to "leave.approved"     → APPROVAL email to faculty
 *                                      → LEAVE NOTICE email to each student
 *  • Listening to "slot.swap.requested" → SLOT SWAP REQUEST email to target faculty
 *
 * Registration: Call  NotificationListener.register()  once at app startup
 * (in server.js).  After that, every eventEmitter.emit() call anywhere in the
 * codebase will automatically trigger the correct handler.
 */

const eventEmitter            = require('./eventEmitter');
const MailService             = require('../mail/MailService');
const ClassCancelledEvent     = require('./events/ClassCancelledEvent');
const LeaveApprovedEvent      = require('./events/LeaveApprovedEvent');
const SlotSwapRequestEvent    = require('./events/SlotSwapRequestEvent');
const AdminAnnouncementEvent  = require('./events/AdminAnnouncementEvent');

// ─── Handler: class.cancelled ─────────────────────────────────────────────────

/**
 * @OnEvent('class.cancelled')
 *
 * 1. Sends a confirmation email to the faculty member.
 * 2. Sends a "Class Cancelled" alert email to every student in studentEmails[].
 *
 * Both sends are attempted independently — a failure in one does not abort the other.
 *
 * @param {ClassCancelledEvent} event
 */
async function onClassCancelled(event) {
    console.log(`[NotificationListener] ▶ class.cancelled — course: ${event.courseCode}`);

    // ── 1. Faculty Confirmation Email ─────────────────────────────────────────
    try {
        await MailService.sendEmail({
            to:       event.facultyEmail,
            subject:  `Class Cancellation Confirmed — ${event.courseName} (${event.cancelDate})`,
            template: 'faculty-confirmation',
            context: {
                facultyName:  event.facultyName,
                courseCode:   event.courseCode,
                courseName:   event.courseName,
                cancelDate:   event.cancelDate,
                cancelReason: event.cancelReason,
            },
        });
    } catch (err) {
        console.error('[NotificationListener] faculty-confirmation mail failed:', err.message);
    }

    // ── 2. Student Alert Emails (one per student) ─────────────────────────────
    if (!event.studentEmails || event.studentEmails.length === 0) {
        console.warn(
            '[NotificationListener] No student emails provided for class.cancelled — skipping student alerts.'
        );
        return;
    }

    const studentMailPromises = event.studentEmails.map((studentEmail) =>
        MailService.sendEmail({
            to:       studentEmail,
            subject:  `[SchedAI] Class Cancelled — ${event.courseName} on ${event.cancelDate}`,
            template: 'student-alert',
            context: {
                courseCode:   event.courseCode,
                courseName:   event.courseName,
                facultyName:  event.facultyName,
                cancelDate:   event.cancelDate,
                cancelReason: event.cancelReason,
            },
        }).catch((err) => {
            // A single failed student email must not block others
            console.error(
                `[NotificationListener] student-alert failed for ${studentEmail}:`,
                err.message
            );
        })
    );

    await Promise.allSettled(studentMailPromises);
    console.log(
        `[NotificationListener] ✅ Student alerts dispatched to ${event.studentEmails.length} recipient(s).`
    );
}

// ─── Handler: leave.approved ──────────────────────────────────────────────────

/**
 * @OnEvent('leave.approved')
 *
 * Sends a leave approval confirmation email to the faculty member.
 *
 * @param {LeaveApprovedEvent} event
 */
async function onLeaveApproved(event) {
    console.log(`[NotificationListener] ▶ leave.approved — faculty: ${event.facultyEmail}`);

    // ── 1. Faculty Approval Email ─────────────────────────────────────────────
    try {
        await MailService.sendEmail({
            to:       event.facultyEmail,
            subject:  `Your Leave Request Has Been Approved — ${event.fromDate} to ${event.toDate}`,
            template: 'leave-approved',
            context: {
                facultyName: event.facultyName,
                leaveType:   event.leaveType,
                fromDate:    event.fromDate,
                toDate:      event.toDate,
                reason:      event.reason,
            },
        });
    } catch (err) {
        console.error('[NotificationListener] leave-approved mail failed:', err.message);
    }

    // ── 2. Student Leave Notice Emails ────────────────────────────────────────
    if (!event.studentEmails || event.studentEmails.length === 0) {
        return;
    }

    const studentMailPromises = event.studentEmails.map((studentEmail) =>
        MailService.sendEmail({
            to:       studentEmail,
            subject:  `[SchedAI] Faculty Leave Notice — ${event.facultyName} (${event.fromDate} to ${event.toDate})`,
            template: 'student-leave-alert',
            context: {
                facultyName: event.facultyName,
                leaveType:   event.leaveType,
                fromDate:    event.fromDate,
                toDate:      event.toDate,
            },
        }).catch((err) => {
            console.error(
                `[NotificationListener] student-leave-alert failed for ${studentEmail}:`,
                err.message
            );
        })
    );

    await Promise.allSettled(studentMailPromises);
    console.log(
        `[NotificationListener] ✅ Student leave notices dispatched to ${event.studentEmails.length} recipient(s).`
    );
}

// ─── Handler: slot.swap.requested ────────────────────────────────────────────

/**
 * @OnEvent('slot.swap.requested')
 *
 * Sends a slot swap request notification email to the TARGET faculty only.
 * Students are NOT notified — this is faculty-to-faculty.
 *
 * @param {SlotSwapRequestEvent} event
 */
async function onSlotSwapRequested(event) {
    console.log(`[NotificationListener] ▶ slot.swap.requested → ${event.targetFacultyEmail}`);

    try {
        await MailService.sendEmail({
            to:       event.targetFacultyEmail,
            subject:  `Slot Swap Request from ${event.requestingFacultyName} — ${event.courseName}`,
            template: 'slot-swap-request',
            context: {
                requestingFacultyName: event.requestingFacultyName,
                courseName:            event.courseName,
                courseId:              event.courseId,
                currentSlot:           event.currentSlot,
                proposedSlot:          event.proposedSlot,
            },
        });
    } catch (err) {
        console.error('[NotificationListener] slot-swap-request mail failed:', err.message);
    }
}

// ─── Handler: admin.announcement ─────────────────────────────────────────────

/**
 * @OnEvent('admin.announcement')
 *
 * Sends the admin announcement email to every address in facultyEmails[].
 * Students are NOT notified — this is a faculty-only notice.
 *
 * @param {AdminAnnouncementEvent} event
 */
async function onAdminAnnouncement(event) {
    console.log(`[NotificationListener] ▶ admin.announcement — "${event.title}"`);

    if (!event.facultyEmails || event.facultyEmails.length === 0) {
        console.warn('[NotificationListener] No faculty emails provided for admin.announcement — skipping.');
        return;
    }

    const mailPromises = event.facultyEmails.map((email) =>
        MailService.sendEmail({
            to:       email,
            subject:  `[SchedAI] Admin Announcement — ${event.title}`,
            template: 'faculty-admin-announcement',
            context: {
                title:       event.title,
                message:     event.message,
                sender:      event.sender,
                eventDate:   event.eventDate !== 'N/A' ? event.eventDate : null,
                eventReason: event.eventReason !== 'N/A' ? event.eventReason : null,
                showDetails: event.eventDate !== 'N/A' || event.eventReason !== 'N/A',
            },
        }).catch((err) => {
            console.error(
                `[NotificationListener] faculty-admin-announcement failed for ${email}:`,
                err.message
            );
        })
    );

    await Promise.allSettled(mailPromises);
    console.log(
        `[NotificationListener] ✅ Admin announcement emails dispatched to ${event.facultyEmails.length} faculty member(s).`
    );
}

// ─── Registration ─────────────────────────────────────────────────────────────

/**
 * Attaches all event listeners to the shared EventEmitter2 instance.
 *
 * Call this ONCE when the server starts (inside server.js):
 *
 *   const NotificationListener = require('./BackendAndDB/notifications/NotificationListener');
 *   NotificationListener.register();
 */
function register() {
    eventEmitter.on(ClassCancelledEvent.EVENT_NAME,    onClassCancelled);
    eventEmitter.on(LeaveApprovedEvent.EVENT_NAME,     onLeaveApproved);
    eventEmitter.on(SlotSwapRequestEvent.EVENT_NAME,   onSlotSwapRequested);
    eventEmitter.on(AdminAnnouncementEvent.EVENT_NAME, onAdminAnnouncement);

    console.log('[NotificationListener] ✅ Registered listeners: class.cancelled, leave.approved, slot.swap.requested, admin.announcement');
}

module.exports = { register };
