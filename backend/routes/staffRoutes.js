const express = require('express');
const {
  getAllStaff,
  getStaff,
  updateStaff,
  deactivateStaff,
  reactivateStaff,
  deleteStaff,
} = require('../controllers/staffController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Entire staff management module is admin-only.
router.use(protect, restrictTo('admin'));

router.get('/', getAllStaff);
router.get('/:id', getStaff);
router.patch('/:id', updateStaff);
router.patch('/:id/deactivate', deactivateStaff);
router.patch('/:id/reactivate', reactivateStaff);
router.delete('/:id', deleteStaff);

module.exports = router;
