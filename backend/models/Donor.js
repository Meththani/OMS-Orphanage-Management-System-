const mongoose = require('mongoose');

// Donors are NOT required to have a User login (your public website workflow
// allows donating without logging in). linkedUser is populated only if a
// donor later registers an account to track their own donation history.
const donorSchema = new mongoose.Schema(
  {
    donorID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    contactDetails: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    type: { type: String, enum: ['individual', 'organization'], required: true },
    preference: { type: String, enum: ['cash', 'goods', 'meal'] },
    totalDonated: { type: Number, default: 0 },
    linkedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donor', donorSchema);
