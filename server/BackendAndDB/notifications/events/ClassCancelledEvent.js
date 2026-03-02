/**
 * notifications/events/ClassCancelledEvent.js
 *
 * Data-carrier class for the "class.cancelled" event.
 * Mirrors a NestJS @nestjs/event-emitter payload class.
 *
 * Emitted by: announcementController.js → facultyCancelClass()
 * Handled by: NotificationListener.js   → onClassCancelled()
 */

class ClassCancelledEvent {
    /**
     * @param {Object} params
     * @param {string} params.facultyEmail          - Recipient email for the confirmation
     * @param {string} params.facultyName           - Faculty display name
     * @param {string} params.courseCode            - e.g. "CS301"
     * @param {string} params.courseName            - e.g. "Data Structures"
     * @param {string} params.cancelDate            - e.g. "2026-03-15"
     * @param {string} [params.cancelReason]        - Optional reason
     * @param {string[]} [params.studentEmails]     - List of student email addresses to alert.
     *                                                Pass an empty array [] if no student list is
     *                                                available — the listener will skip student mail.
     */
    constructor({
        facultyEmail,
        facultyName,
        courseCode,
        courseName,
        cancelDate,
        cancelReason = 'Not specified',
        studentEmails = [],
    }) {
        this.facultyEmail   = facultyEmail;
        this.facultyName    = facultyName;
        this.courseCode     = courseCode;
        this.courseName     = courseName;
        this.cancelDate     = cancelDate;
        this.cancelReason   = cancelReason;
        this.studentEmails  = studentEmails;
    }
}

// The string token used with eventEmitter.emit() and eventEmitter.on()
ClassCancelledEvent.EVENT_NAME = 'class.cancelled';

module.exports = ClassCancelledEvent;
