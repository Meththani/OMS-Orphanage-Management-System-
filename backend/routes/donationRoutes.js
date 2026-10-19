const express = require('express');
const {
  createDonation,
  getAllDonations,
  getDonation,
  updateDonationStatus,
  getMyDonations,
  updateDonation,
  sendMealSmsReminder,
} = require('../controllers/donationController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Donor: read-only access to their own donation history. No write access —
// see the disagreement note in the chat response for why.
router.get('/my', restrictTo('donor'), getMyDonations);

// Everything below is Admin/Staff/Accountant only.
router.use(restrictTo('admin', 'staff', 'accountant'));

const Donor = require('../models/Donor');
router.get('/donors-list', async (req, res) => {
  try {
    const donors = await Donor.find().sort('name');
    res.status(200).json({ status: 'success', data: donors });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Staff, Admin, and Accountant can view all donations and register new donations
router.route('/').get(getAllDonations).post(createDonation);

// Staff, Admin, and Accountant can view individual donation details; ONLY Admin and Accountant can edit
router.route('/:id').get(getDonation).put(restrictTo('admin', 'accountant'), updateDonation);

// ONLY Admin and Accountant can update status (approve, reject, cancel)
router.patch('/:id/status', restrictTo('admin', 'accountant'), updateDonationStatus);

// ONLY Admin and Accountant can trigger action updates (like SMS reminders)
router.post('/:id/send-sms', restrictTo('admin', 'accountant'), sendMealSmsReminder);

module.exports = router;
