const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    category: { type: String, required: true }, // e.g., Donation, Grant, Fundraising Event
    date: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'cheque', 'bank_transfer', 'online'], required: true },
    donor: { type: String, default: 'Anonymous' },
    refReceipt: { type: String }, // Receipt reference or transaction ID
    bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },
    proofOfReceipt: {
      fileData: { type: String }, // Base64 data URI
      fileName: { type: String },
      fileType: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Income', incomeSchema);
