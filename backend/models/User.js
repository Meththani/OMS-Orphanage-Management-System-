const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Single collection for all logged-in roles, per the Design Report's `users` schema.
// Donor profiles for public, non-account donors live separately in models/Donor.js
// and are optionally linked here via Donor.linkedUser if a donor registers an account.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    DOB: { type: Date },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ['admin', 'staff', 'accountant', 'donor'],
      required: true,
      default: 'staff',
    },
    contactDetails: { type: String },
    nic: { type: String },       // staff/admin identification
    jobRole: { type: String },   // e.g. "Caregiver", "Warden" — free text job title
    department: { type: String },
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return Boolean(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model('User', userSchema);
