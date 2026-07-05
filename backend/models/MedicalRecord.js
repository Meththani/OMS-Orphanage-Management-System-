const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    childID: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    recordDate: { type: Date, required: true, default: Date.now },
    diagnosis: { type: String, required: true },
    treatment: { type: String },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' },
    notes: { type: String },
  },
  { timestamps: true }
);

medicalRecordSchema.index({ childID: 1, recordDate: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
