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

// POST /api/public/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, name, email, contactDetails, notes } = req.body;
    if (!amount || !name || !email) {
      return res.status(400).json({ status: 'fail', message: 'Missing required checkout fields.' });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder_key_replace_me') {
      // Simulate successful checkout database recording (since webhook won't be called for sandbox demo)
      try {
        let donor = await Donor.findOne({ email: email.toLowerCase() });
        if (!donor) {
          donor = await Donor.create({
            donorID: generateID('DON'),
            name,
            email: email.toLowerCase(),
            contactDetails: contactDetails || 'N/A',
            type: 'individual',
            preference: 'cash',
            totalDonated: 0,
          });
        }

        const donation = await CashDonation.create({
          donationID: generateID('CSH'),
          donorID: donor._id,
          amount: Number(amount),
          paymentMethod: 'online',
          status: 'received',
          receiptRef: generateID('REC'),
          notes: notes || 'Submitted via Sandbox Mock Checkout (Stripe key not configured).',
        });

        donor.totalDonated += Number(amount);
        await donor.save();

        const defaultAccount = await BankAccount.findOne();
        if (defaultAccount) {
          await Income.create({
            category: 'Public Donation',
            amount: Number(amount),
            paymentMethod: 'online',
            donor: name,
            refReceipt: donation.receiptRef,
            bankAccount: defaultAccount._id,
          });

          defaultAccount.balance += Number(amount);
          await defaultAccount.save();
        }
      } catch (dbErr) {
        console.error('Mock DB update error:', dbErr.message);
      }

      return res.status(200).json({ 
        status: 'success', 
        url: `http://localhost:5173/?status=success&amount=${amount}` 
      });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: 'Orphanage Cash Donation',
              description: 'General Expenses Fund Donation',
            },
            unit_amount: Number(amount) * 100, // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email.toLowerCase(),
      metadata: {
        donorName: name,
        donorEmail: email.toLowerCase(),
        contactDetails: contactDetails || 'N/A',
        notes: notes || '',
      },
      success_url: `http://localhost:5173/?status=success&amount=${amount}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/?status=cancel`,
    });

    res.status(200).json({ status: 'success', url: session.url });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/public/confirm-checkout-session
router.post('/confirm-checkout-session', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ status: 'fail', message: 'Missing sessionId.' });
    }

    // Check if we have already recorded this session to prevent double recording
    const existingDonation = await CashDonation.findOne({ receiptRef: sessionId });
    if (existingDonation) {
      return res.status(200).json({ status: 'success', message: 'Donation already recorded.', data: existingDonation });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder_key_replace_me') {
      return res.status(400).json({ status: 'fail', message: 'Stripe Secret Key is not configured.' });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ status: 'fail', message: 'Payment has not been completed.' });
    }

    const amount = session.amount_total / 100;
    const email = session.customer_email || session.metadata.donorEmail;
    const name = session.metadata.donorName || 'Anonymous Donor';
    const contactDetails = session.metadata.contactDetails || 'N/A';

    // Find or create donor profile
    let donor = await Donor.findOne({ email: email.toLowerCase() });
    if (!donor) {
      donor = await Donor.create({
        donorID: generateID('DON'),
        name,
        email: email.toLowerCase(),
        contactDetails,
        type: 'individual',
        preference: 'cash',
        totalDonated: 0,
      });
    }

    // Create Cash Donation record
    const donation = await CashDonation.create({
      donationID: generateID('CSH'),
      donorID: donor._id,
      amount,
      paymentMethod: 'online',
      status: 'received',
      receiptRef: sessionId,
      notes: session.metadata.notes || 'Submitted and verified via Stripe Checkout session.',
    });

    // Update Donor total
    donor.totalDonated += amount;
    await donor.save();

    // Record Income in financials
    const defaultAccount = await BankAccount.findOne();
    if (defaultAccount) {
      await Income.create({
        category: 'Public Donation',
        amount,
        paymentMethod: 'online',
        donor: name,
        refReceipt: donation.receiptRef,
        bankAccount: defaultAccount._id,
      });

      defaultAccount.balance += amount;
      await defaultAccount.save();
    }

    res.status(200).json({ status: 'success', data: donation });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/public/stripe-webhook
router.post('/stripe-webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret !== 'whsec_placeholder_webhook_secret_replace_me') {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } else {
      // Fallback if signature verification is not enabled / webhook secret is not set (useful for testing)
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      const amount = session.amount_total / 100;
      const email = session.customer_email || session.metadata.donorEmail;
      const name = session.metadata.donorName || 'Anonymous Donor';
      const contactDetails = session.metadata.contactDetails || 'N/A';

      // Find or create donor profile
      let donor = await Donor.findOne({ email: email.toLowerCase() });
      if (!donor) {
        donor = await Donor.create({
          donorID: generateID('DON'),
          name,
          email: email.toLowerCase(),
          contactDetails,
          type: 'individual',
          preference: 'cash',
          totalDonated: 0,
        });
      }

      // Create Cash Donation record
      const donation = await CashDonation.create({
        donationID: generateID('CSH'),
        donorID: donor._id,
        amount,
        paymentMethod: 'online',
        status: 'received',
        receiptRef: generateID('REC'),
        notes: session.metadata.notes || 'Submitted via Stripe Checkout.',
      });

      // Update Donor total
      donor.totalDonated += amount;
      await donor.save();

      // Record Income in financials
      const defaultAccount = await BankAccount.findOne();
      if (defaultAccount) {
        await Income.create({
          category: 'Public Donation',
          amount,
          paymentMethod: 'online',
          donor: name,
          refReceipt: donation.receiptRef,
          bankAccount: defaultAccount._id,
        });

        defaultAccount.balance += amount;
        await defaultAccount.save();
      }

      console.log(`Successfully processed Stripe donation: LKR ${amount} from ${name}`);
    } catch (dbErr) {
      console.error('Error processing Stripe donation in database:', dbErr.message);
      return res.status(500).json({ status: 'error', message: 'Failed to record donation' });
    }
  }

  res.json({ received: true });
});


// POST /api/public/donate-cash
router.post('/donate-cash', async (req, res) => {
  try {
    const { name, email, contactDetails, type, amount, paymentMethod, proof, notes } = req.body;
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

    const isOnline = paymentMethod === 'online';

    // Create Cash Donation record
    const donation = await CashDonation.create({
      donationID: generateID('CSH'),
      donorID: donor._id,
      amount: Number(amount),
      paymentMethod,
      status: isOnline ? 'received' : 'pending',
      receiptRef: isOnline ? generateID('REC') : undefined,
      notes: notes || (isOnline ? 'Submitted via public website donation portal (Stripe).' : 'Submitted via public website donation portal (Bank Transfer). Pending approval.'),
      proofOfPayment: proof || undefined,
    });

    if (isOnline) {
      // Update Donor total
      donor.totalDonated += Number(amount);
      await donor.save();

      // Dynamically record Income in financials
      const defaultAccount = await BankAccount.findOne();
      if (defaultAccount) {
        await Income.create({
          category: 'Public Donation',
          amount: Number(amount),
          paymentMethod: 'online',
          donor: name,
          refReceipt: donation.receiptRef,
          bankAccount: defaultAccount._id,
        });

        defaultAccount.balance += Number(amount);
        await defaultAccount.save();
      }
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
