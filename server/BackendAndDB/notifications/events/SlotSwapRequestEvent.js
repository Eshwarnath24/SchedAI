/**
 * notifications/events/SlotSwapRequestEvent.js
 *
 * Data-carrier class for the "slot.swap.requested" event.
 *
 * Emitted by: announcementController.js → requestSlotSwap()
 * Handled by: NotificationListener.js   → onSlotSwapRequested()
 */

class SlotSwapRequestEvent {
    /**
     * @param {Object} params
     * @param {string} params.targetFacultyEmail        - Target faculty's email address
     * @param {string} params.requestingFacultyName     - Name of the faculty requesting the swap
     * @param {string} params.currentSlot               - e.g. "Monday 9AM"
     * @param {string} params.proposedSlot              - e.g. "Tuesday 11AM"
     * @param {string} [params.courseId]                - e.g. "CS301"
     * @param {string} [params.courseName]              - e.g. "Data Structures"
     */
    constructor({
        targetFacultyEmail,
        requestingFacultyName,
        currentSlot,
        proposedSlot,
        courseId = 'N/A',
        courseName = 'N/A',
    }) {
        this.targetFacultyEmail   = targetFacultyEmail;
        this.requestingFacultyName = requestingFacultyName;
        this.currentSlot          = currentSlot;
        this.proposedSlot         = proposedSlot;
        this.courseId             = courseId;
        this.courseName           = courseName;
    }
}

SlotSwapRequestEvent.EVENT_NAME = 'slot.swap.requested';

module.exports = SlotSwapRequestEvent;
