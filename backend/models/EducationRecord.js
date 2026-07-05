const mongoose = require('mongoose');

const educationRecordSchema = new mongoose.Schema(
  {
    childID: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    schoolName: { type: String, required: true },
    grade: { type: String, required: true },
    status: { type: String, enum: ['enrolled', 'graduated', 'transferred'], default: 'enrolled' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EducationRecord', educationRecordSchema);
