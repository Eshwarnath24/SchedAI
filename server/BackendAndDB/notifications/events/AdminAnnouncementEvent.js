/**
 * notifications/events/AdminAnnouncementEvent.js
 *
 * Data-carrier for the "admin.announcement" event.
 *
 * Emitted by: announcementController.js → adminCancelClassEvent()
 * Handled by: NotificationListener.js   → onAdminAnnouncement()
 *
 * Sent ONLY to faculty — not to students.
 */

class AdminAnnouncementEvent {
    /**
     * @param {Object}   params
     * @param {string}   params.title           - Announcement title
     * @param {string}   params.message         - Announcement body
     * @param {string}   [params.sender]        - Sender name, defaults to 'Admin'
     * @param {string}   [params.eventDate]     - Optional date string, e.g. "2026-03-15"
     * @param {string}   [params.eventReason]   - Optional reason / venue info
     * @param {string[]} params.facultyEmails   - List of faculty email addresses to notify
     */
    constructor({
        title,
        message,
        sender = 'Admin',
        eventDate = 'N/A',
        eventReason = 'N/A',
        facultyEmails = [],
    }) {
        this.title        = title;
        this.message      = message;
        this.sender       = sender;
        this.eventDate    = eventDate;
        this.eventReason  = eventReason;
        this.facultyEmails = facultyEmails;
    }
}

AdminAnnouncementEvent.EVENT_NAME = 'admin.announcement';

module.exports = AdminAnnouncementEvent;
