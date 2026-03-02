const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

// ─── GET /api/announcements ───────────────────────────────────────────────────
// Fetch all persistent bulletin-board announcements.
// Sorted: priorityWeight DESC → createdAt DESC (highest priority, newest first).
router.get('/', announcementController.getAnnouncements);

// ─── POST /api/announcements/admin-cancel-event ───────────────────────────────
// Admin cancels a class due to a campus event.
// Saves to DB (bulletin board) + fans out a Novu `global-alert` to topic `all-users`.
router.post('/admin-cancel-event', announcementController.adminCancelClassEvent);

// ─── POST /api/announcements/faculty-cancel-class ────────────────────────────
// Faculty cancels a specific class session.
// Sends Novu `class-cancelled-student` (HIGH) to course student topic +
//       Novu `class-cancelled-faculty` (LOW) to the cancelling faculty.
router.post('/faculty-cancel-class', announcementController.facultyCancelClass);

// ─── POST /api/announcements/request-slot-swap ───────────────────────────────
// Faculty requests a slot swap with another faculty.
// Sends Novu `slot-swap-request` (MEDIUM) only to the target faculty.
router.post('/request-slot-swap', announcementController.requestSlotSwap);

module.exports = router;
