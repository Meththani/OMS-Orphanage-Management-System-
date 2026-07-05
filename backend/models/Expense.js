const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    category: { type: String, required: true }, // e.g., Food & Nutrition, Salaries, Utility Bills, Medical, Maintenance
    staffName: { type: String, required: true }, // Staff member recording/claiming the expense
    date: { type: Date, required: true, default: Date.now },
    referenceReceipt: { type: String }, // Invoice/receipt reference code
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    bankAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'BankAccount' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
