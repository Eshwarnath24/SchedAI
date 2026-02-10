const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // --- Auth Fields ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // UPDATED: 'HOD' removed, 'Admin' added.
  role: { 
    type: String, 
    enum: ['Admin', 'Faculty'], 
    default: 'Faculty' 
  },

  avatar: { type: String }, // URL for profile picture
  department: { type: String, required: true }, // e.g., "CSE"

  // --- Faculty Constraints (For GA) ---
  // Note: Admins might not need these, but we keep them in case an Admin is also a Professor.
  rank: { 
    type: String, 
    enum: ['Professor', 'Associate Prof', 'Assistant Prof', 'Adjunct'],
    required: function() { return this.role === 'Faculty'; } // Only required if they are Faculty
  },
  
  maxLoad: { type: Number, default: 12 }, 
  contractedDays: [{ type: String }], 
  
  unavailableSlots: [{ type: Number }], 
  preferredSlots: [{ type: Number }],
  
  expertise: [{ type: String }],
  
  // --- Dashboard Data ---
  officeLocation: { type: String }, 
  phone: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);