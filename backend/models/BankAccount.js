const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema(
  {
    accountName: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true },
    initialBalance: { type: Number, required: true, default: 0 },
    balance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BankAccount', bankAccountSchema);
