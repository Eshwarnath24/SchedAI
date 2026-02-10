const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  sender: { type: String, default: 'Admin' }
});

module.exports = mongoose.model('Announcement', announcementSchema);