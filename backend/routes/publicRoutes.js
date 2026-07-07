const express = require('express');
const { CashDonation, MealDonation } = require('../models/Donation');
const Donor = require('../models/Donor');
const Message = require('../models/Message');
const BankAccount = require('../models/BankAccount');
const Income = require('../models/Income');
const Child = require('../models/Child');

const router = express.Router();

// Helper to generate IDs
const generateID = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;

// POST /api/public/donate-cash
router.post('/donate-cash', async (req, res) => {
  try {
    const { name, email, contactDetails, type, amount, paymentMethod } = req.body;
    if (!name || !email || !amount || !paymentMethod) {
      return res.status(400).json({ status: 'fail', message: 'Missing required donation fields.' });
    }

    // Find or create donor profile
    let donor = await Donor.findOne({ email: email.toLowerCase() });
    if (!donor) {
      donor = await Donor.create({
        donorID: generateID('DON'),
        name,
        email: email.toLowerCase(),
        contactDetails: contactDetails || 'N/A',
        type: type || 'individual',
        preference: 'cash',
        totalDonated: 0,
      });
    }

    // Create Cash Donation record
    const donation = await CashDonation.create({
      donationID: generateID('CSH'),
      donorID: donor._id,
      amount: Number(amount),
      paymentMethod,
      status: 'received', // Auto-received for card/online
      receiptRef: generateID('REC'),
      notes: 'Submitted via public website donation portal.',
    });

    // Update Donor total
    donor.totalDonated += Number(amount);
    await donor.save();

    // Dynamically record Income in financials
    const defaultAccount = await BankAccount.findOne();
    if (defaultAccount) {
      await Income.create({
        category: 'Public Donation',
        amount: Number(amount),
        paymentMethod: paymentMethod === 'online' ? 'online' : 'bank_transfer',
        donor: name,
        refReceipt: donation.receiptRef,
        bankAccount: defaultAccount._id,
      });

      defaultAccount.balance += Number(amount);
      await defaultAccount.save();
    }

    res.status(201).json({ status: 'success', data: donation });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// GET /api/public/booked-meals
router.get('/booked-meals', async (req, res) => {
  try {
    const bookings = await MealDonation.find(
      { status: { $ne: 'cancelled' } },
      'mealDate mealType quantity occasion menuPackage status'
    ).populate('donorID', 'name');

    const activeChildCount = await Child.countDocuments({ status: 'active' });

    res.status(200).json({
      status: 'success',
      data: {
        bookings: bookings.map(b => ({
          _id: b._id,
          mealDate: b.mealDate,
          mealType: b.mealType,
          quantity: b.quantity,
          occasion: b.occasion,
          menuPackage: b.menuPackage,
          donorName: b.donorID ? b.donorID.name : 'Generous Donor',
          status: b.status
        })),
        activeChildCount: activeChildCount || 0
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/public/book-meal
router.post('/book-meal', async (req, res) => {
  try {
    const { name, email, contactDetails, mealDate, mealType, quantity, occasion, menuPackage, dietaryNotes } = req.body;
    if (!name || !email || !mealDate || !mealType || !quantity) {
      return res.status(400).json({ status: 'fail', message: 'Missing required meal fields.' });
    }

    // Check for double booking
    const targetDate = new Date(mealDate);
    const dateStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const dateEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const existingBooking = await MealDonation.findOne({
      mealDate: { $gte: dateStart, $lte: dateEnd },
      mealType,
      status: { $ne: 'cancelled' }
    });

    if (existingBooking) {
      return res.status(400).json({ status: 'fail', message: `The ${mealType} slot for this date is already booked.` });
    }

    // Find or create donor profile
    let donor = await Donor.findOne({ email: email.toLowerCase() });
    if (!donor) {
      donor = await Donor.create({
        donorID: generateID('DON'),
        name,
        email: email.toLowerCase(),
        contactDetails: contactDetails || 'N/A',
        type: 'individual',
        preference: 'meal',
      });
    }

    // Create Meal Donation record
    const donation = await MealDonation.create({
      donationID: generateID('MEL'),
      donorID: donor._id,
      mealDate: new Date(mealDate),
      mealType,
      quantity: Number(quantity),
      status: 'received',
      occasion,
      menuPackage: menuPackage || 'standard',
      dietaryNotes,
      notes: occasion ? `Sponsorship for occasion: ${occasion}` : 'Booked via public website meal portal.',
    });

    res.status(201).json({ status: 'success', data: donation });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// POST /api/public/contact
router.post('/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ status: 'fail', message: 'Missing required contact fields.' });
    }

    const newMessage = await Message.create({
      firstName,
      lastName,
      email,
      phone,
      message,
    });

    res.status(201).json({ status: 'success', data: newMessage });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
