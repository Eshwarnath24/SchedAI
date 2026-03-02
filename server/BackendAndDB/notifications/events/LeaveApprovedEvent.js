/**
 * notifications/events/LeaveApprovedEvent.js
 *
 * Data-carrier class for the "leave.approved" event.
 * Mirrors a NestJS @nestjs/event-emitter payload class.
 *
 * Emitted by: leaveController.js (when an admin approves a leave request)
 * Handled by: NotificationListener.js → onLeaveApproved()
 */

class LeaveApprovedEvent {
    /**
     * @param {Object} params
     * @param {string}   params.facultyEmail    - Faculty's email address
     * @param {string}   params.facultyName     - Faculty display name
     * @param {string}   params.fromDate        - Leave start date  (YYYY-MM-DD)
     * @param {string}   params.toDate          - Leave end date    (YYYY-MM-DD)
     * @param {string}   [params.leaveType]     - e.g. "Casual", "Sick", "Duty"
     * @param {string}   [params.reason]        - Optional leave reason
     * @param {string[]} [params.studentEmails] - Students to notify about the approved leave.
     *                                            Pass [] to skip student emails.
     */
    constructor({
        facultyEmail,
        facultyName,
        fromDate,
        toDate,
        leaveType = 'Casual',
        reason = 'N/A',
        studentEmails = [],
    }) {
        this.facultyEmail   = facultyEmail;
        this.facultyName    = facultyName;
        this.fromDate       = fromDate;
        this.toDate         = toDate;
        this.leaveType      = leaveType;
        this.reason         = reason;
        this.studentEmails  = studentEmails;
    }
}

// The string token used with eventEmitter.emit() and eventEmitter.on()
LeaveApprovedEvent.EVENT_NAME = 'leave.approved';

module.exports = LeaveApprovedEvent;
