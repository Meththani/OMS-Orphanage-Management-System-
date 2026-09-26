const { Donation, CashDonation, GoodsDonation, MealDonation } = require('../models/Donation');
const Donor = require('../models/Donor');
const BankAccount = require('../models/BankAccount');
const Income = require('../models/Income');
const { sendSMS, buildMealSmsText } = require('../services/smsService');

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
        if (donor && donor.contactDetails && donor.contactDetails !== 'N/A') {
          const mealDateFormatted = new Date(donation.mealDate).toLocaleDateString(undefined, {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
          });
          const smsText = buildMealSmsText({
            donorName: donor.name,
            mealDateFormatted,
            mealType: donation.mealType,
            quantity: donation.quantity,
            isReminder: false,
          });
          const smsResult = await sendSMS({ to: donor.contactDetails, message: smsText });
          donation.smsSent = smsResult.success;
          donation.lastSmsSentAt = new Date();
          donation.smsLogs = [{
            sentAt: new Date(),
            type: 'booking_confirmation',
            phone: donor.contactDetails,
            message: smsText,
            provider: smsResult.provider,
            status: smsResult.success ? 'success' : 'failed',
            messageId: smsResult.messageId || null,
          }];
          await donation.save();
        }
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

    // Auto-generate receipt reference if cash donation is approved and lacks one
    if (donation.type === 'cash' && status === 'received' && !donation.receiptRef) {
      donation.receiptRef = `REC-${Date.now().toString().slice(-6)}`;
    }

    donation.status = status;
    await donation.save();

    // If a cash donation is marked as received, record income in bank and update donor stats
    if (donation.type === 'cash' && status === 'received') {
      const existingIncome = await Income.findOne({ refReceipt: donation.receiptRef || donation.donationID });
      if (!existingIncome) {
        const defaultAccount = await BankAccount.findOne();
        if (defaultAccount) {
          const populatedDonation = await donation.populate('donorID');
          await Income.create({
            category: 'Public Donation',
            amount: donation.amount,
            paymentMethod: donation.paymentMethod || 'bank_transfer',
            donor: populatedDonation.donorID ? populatedDonation.donorID.name : 'Anonymous',
            refReceipt: donation.receiptRef || donation.donationID,
            bankAccount: defaultAccount._id,
          });
          defaultAccount.balance += donation.amount;
          await defaultAccount.save();
        }
      }

      // Update donor total
      const Donor = require('../models/Donor');
      const donor = await Donor.findById(donation.donorID);
      if (donor) {
        donor.totalDonated = (donor.totalDonated || 0) + donation.amount;
        await donor.save();
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

// PUT /api/donations/:id — Admin/Staff/Accountant only
exports.updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ status: 'fail', message: 'Donation not found.' });
    }

    const fieldsToUpdate = [
      'status', 'receiptRef', 'notes', 'mealDate', 'mealType',
      'quantity', 'occasion', 'menuPackage', 'dietaryNotes', 'amount',
      'paymentMethod', 'itemType', 'donorID',
      'mealDonationType', 'estimatedCost', 'donorCooksMenu'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'mealDate' || field === 'date') {
          donation[field] = new Date(req.body[field]);
        } else {
          donation[field] = req.body[field];
        }
      }
    });

    await donation.save();
    res.status(200).json({ status: 'success', data: donation });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// POST /api/donations/:id/send-sms — Trigger manual SMS reminder to meal donor
exports.sendMealSmsReminder = async (req, res) => {
  try {
    const donation = await MealDonation.findById(req.params.id).populate('donorID');
    if (!donation) {
      return res.status(404).json({ status: 'fail', message: 'Meal donation record not found.' });
    }

    const donor = donation.donorID;
    if (!donor || !donor.contactDetails || donor.contactDetails === 'N/A') {
      return res.status(400).json({ status: 'fail', message: 'Donor phone number is missing or invalid.' });
    }

    const mealDateFormatted = new Date(donation.mealDate).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const smsText = buildMealSmsText({
      donorName: donor.name || 'Valued Donor',
      mealDateFormatted,
      mealType: donation.mealType,
      quantity: donation.quantity,
      isReminder: true,
    });

    const result = await sendSMS({ to: donor.contactDetails, message: smsText });

    donation.smsSent = result.success;
    donation.lastSmsSentAt = new Date();
    if (!donation.smsLogs) donation.smsLogs = [];
    donation.smsLogs.push({
      sentAt: new Date(),
      type: 'manual_reminder',
      phone: donor.contactDetails,
      message: smsText,
      provider: result.provider,
      status: result.success ? 'success' : 'failed',
      messageId: result.messageId || null,
      error: result.error || null,
    });

    await donation.save();

    res.status(200).json({
      status: 'success',
      message: result.simulated
        ? `[Simulation Mode] SMS reminder logged to server console for ${donor.name} (${donor.contactDetails}).`
        : `SMS reminder sent successfully to ${donor.contactDetails}!`,
      data: donation,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

