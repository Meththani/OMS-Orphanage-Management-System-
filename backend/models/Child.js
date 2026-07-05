const mongoose = require('mongoose');

const childSchema = new mongoose.Schema(
  {
    childID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    DOB: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    admissionDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    guardianInfo: {
      name: String,
      relation: String,
      contact: String,
    },
    bloodType: { type: String },
    allergies: { type: String },
    assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Child', childSchema);
