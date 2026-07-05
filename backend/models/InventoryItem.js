const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, enum: ['Food', 'Medicine', 'Education', 'Clothing', 'Other'], required: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, required: true }, // e.g., kg, liters, boxes, pieces
    status: { type: String, enum: ['in-stock', 'low-stock', 'out-of-stock'], default: 'in-stock' },
  },
  { timestamps: true }
);

// Pre-save hook to calculate item status automatically based on quantity
inventoryItemSchema.pre('save', function (next) {
  if (this.quantity === 0) {
    this.status = 'out-of-stock';
  } else if (this.quantity < 10) {
    this.status = 'low-stock';
  } else {
    this.status = 'in-stock';
  }
  next();
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
