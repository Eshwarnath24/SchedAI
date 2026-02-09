const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  reason: { type: String },
  type: { type: String, enum: ['Sick', 'Casual', 'Duty'], default: 'Casual' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);