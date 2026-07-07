const express = require('express');
const {
  createDonation,
  getAllDonations,
  getDonation,
  updateDonationStatus,
  getMyDonations,
  updateDonation,
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

router.route('/').get(getAllDonations).post(createDonation);

router.route('/:id').get(getDonation).put(updateDonation);

router.patch('/:id/status', updateDonationStatus);

module.exports = router;
