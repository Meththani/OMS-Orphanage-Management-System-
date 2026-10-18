const mongoose = require('mongoose');

// Tracks every stock movement: receipts (goods received in) and issues (goods used out)
const stockMovementSchema = new mongoose.Schema(
  {
    // Reference number - auto-generated
    // GRN-YYYY-NNN  for receipts
    // ISS-YYYY-NNN  for issues
    referenceNumber: { type: String, required: true, unique: true },

    // Type of movement
    type: {
      type: String,
      enum: ['receipt', 'issue'],
      required: true,
    },

    // Item affected
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },

    // Quantity moved (always positive; direction determined by type)
    quantity: { type: Number, required: true, min: 1 },

    // For receipt: where did the stock come from?
    supplier: { type: String, trim: true, default: '' },

    // For issue: why was it used / who requested it?
    issuedTo: { type: String, trim: true, default: '' },   // e.g., "Kitchen Staff", "Nurse"
    purpose: { type: String, trim: true, default: '' },    // reason / description

    // Date of movement
    date: { type: Date, required: true, default: Date.now },

    // Who recorded this entry
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recordedByName: { type: String, default: '' },

    // Snapshot of stock levels at the time of movement
    stockBefore: { type: Number, default: 0 },
    stockAfter: { type: Number, default: 0 },
  },
  { timestamps: true }
);

stockMovementSchema.index({ itemId: 1, date: -1 });
stockMovementSchema.index({ type: 1, date: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
