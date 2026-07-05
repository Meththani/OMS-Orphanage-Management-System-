const { Donation, CashDonation, GoodsDonation, MealDonation } = require('../models/Donation');
const Donor = require('../models/Donor');
const BankAccount = require('../models/BankAccount');
const Income = require('../models/Income');

const generateDonationID = () => `DON-${Date.now()}`;

// POST /api/donations  (body.type = "cash" | "goods" | "meal")
// Admin/Staff/Accountant only — see donationRoutes.js. Donors never hit this
// endpoint directly; if you want public self-service donation submission,
// add a separate, status-locked endpoint rather than opening this one up.
exports.createDonation = async (req, res) => {
  try {
    const { type, donorID } = req.body;

    const donor = await Donor.findById(donorID);
    if (!donor) return res.status(404).json({ status: 'fail', message: 'Donor not found.' });

    const payload = {
      ...req.body,
      donationID: generateDonationID(),
      recordedBy: req.user._id,
    };

    let donation;
    switch (type) {
      case 'cash':
        donation = await CashDonation.create(payload);
        donor.totalDonated = (donor.totalDonated || 0) + (payload.amount || 0);
        await donor.save();
        break;
      case 'goods':
        donation = await GoodsDonation.create(payload);
        break;
      case 'meal':
        donation = await MealDonation.create(payload);
        break;
      default:
        return res.status(400).json({ status: 'fail', message: 'type must be cash, goods, or meal.' });
    }

    res.status(201).json({ status: 'success', data: donation });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// GET /api/donations?type=cash&status=pending
exports.getAllDonations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const donations = await Donation.find(filter)
      .populate('donorID', 'name email type')
      .sort('-date');

    res.status(200).json({ status: 'success', results: donations.length, data: donations });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/donations/:id
exports.getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donorID', 'name email type');
    if (!donation) return res.status(404).json({ status: 'fail', message: 'Donation not found.' });
    res.status(200).json({ status: 'success', data: donation });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/donations/:id/status — Admin/Staff/Accountant only, never Donor
exports.updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'received', 'cancelled'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid status value.' });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ status: 'fail', message: 'Donation not found.' });

    if (donation.status === status) {
      return res.status(200).json({ status: 'success', data: donation });
    }

    donation.status = status;
    await donation.save();

    // If a cash donation is marked as received, record income in bank
    if (donation.type === 'cash' && status === 'received') {
      const existingIncome = await Income.findOne({ refReceipt: donation.receiptRef || donation.donationID });
      if (!existingIncome) {
        const defaultAccount = await BankAccount.findOne();
        if (defaultAccount) {
          await Income.create({
            category: 'Direct Donation',
            amount: donation.amount,
            paymentMethod: donation.paymentMethod || 'cash',
            donor: donation.donorID ? (await donation.populate('donorID')).donorID.name : 'Anonymous',
            refReceipt: donation.receiptRef || donation.donationID,
            bankAccount: defaultAccount._id,
          });
          defaultAccount.balance += donation.amount;
          await defaultAccount.save();
        }
      }
    }

    res.status(200).json({ status: 'success', data: donation });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/donations/my — Donor role, read-only self-service
exports.getMyDonations = async (req, res) => {
  try {
    const donor = await Donor.findOne({ linkedUser: req.user._id });
    if (!donor) {
      return res.status(404).json({ status: 'fail', message: 'No donor profile linked to this account.' });
    }

    const donations = await Donation.find({ donorID: donor._id }).sort('-date');
    res.status(200).json({ status: 'success', results: donations.length, data: donations });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
