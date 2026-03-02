const mongoose = require('mongoose');

// =============================================================================
// ANNOUNCEMENT SCHEMA
// Purpose: Stores PERSISTENT, global announcements that appear on the bulletin
//          board UI. Transient alerts (class cancellations, slot swaps) are
//          handled exclusively by Novu's Inbox — they do NOT need to be saved here
//          unless they also need to appear on the board (see adminCancelClassEvent).
// =============================================================================

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    sender: {
      // Can be a free-form name ("Admin") or an ObjectId ref to User.
      // Stored as String for simplicity; swap to ObjectId if you want
      // populated queries: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      type: String,
      default: 'Admin'
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    },

    // ─── Hidden Sort Field ────────────────────────────────────────────────
    // Automatically computed from `priority` so MongoDB can sort purely
    // numerically:  HIGH → 3 | MEDIUM → 2 | LOW → 1
    // The `pre('save')` hook keeps this in sync automatically.
    priorityWeight: {
      type: Number,
      default: 2  // mirrors default priority of 'MEDIUM'
    }
  },
  {
    timestamps: true  // adds `createdAt` & `updatedAt` — used for secondary sort
  }
);

// =============================================================================
// PRE-SAVE HOOK — keep priorityWeight in sync with priority automatically
// =============================================================================
const PRIORITY_WEIGHT_MAP = { HIGH: 3, MEDIUM: 2, LOW: 1 };

announcementSchema.pre('save', function (next) {
  this.priorityWeight = PRIORITY_WEIGHT_MAP[this.priority] ?? 2;
  next();
});

module.exports = mongoose.model('Announcement', announcementSchema);