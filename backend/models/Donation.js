const mongoose = require('mongoose');
const { Schema } = mongoose;

// NOTE: Your Design Report uses a single `donations` collection with an enum
// `type` field plus conditional-required sibling fields (amount required if
// cash, itemType/quantity required if goods). Mongoose discriminators give
// you the same single-collection storage but with real schema-level
// validation per type instead of manual conditional logic in the
// controller. [Guessing] this is the better trade for you — if your team
// prefers to keep it as one flat schema matching the report exactly,
// say so and I'll rewrite it that way.

const baseOptions = {
  discriminatorKey: 'type',
  collection: 'donations',
  timestamps: true,
};

const donationSchema = new Schema(
  {
    donationID: { type: String, required: true, unique: true },
    donorID: { type: Schema.Types.ObjectId, ref: 'Donor', required: true },
    date: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['pending', 'received', 'cancelled'], default: 'pending' },
    receiptRef: { type: String },
    notes: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // staff/admin/accountant who logged it
  },
  baseOptions
);

const Donation = mongoose.model('Donation', donationSchema);

const CashDonation = Donation.discriminator(
  'cash',
  new Schema({
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['cash', 'cheque', 'bank_transfer'] },
  })
);

const GoodsDonation = Donation.discriminator(
  'goods',
  new Schema({
    itemType: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  })
);

const MealDonation = Donation.discriminator(
  'meal',
  new Schema({
    mealDate: { type: Date, required: true },
    mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
    quantity: { type: Number, required: true, min: 1 },
  })
);

module.exports = { Donation, CashDonation, GoodsDonation, MealDonation };
