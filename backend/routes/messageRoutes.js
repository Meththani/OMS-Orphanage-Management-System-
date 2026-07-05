const express = require('express');
const {
  getMessages,
  updateMessageStatus,
} = require('../controllers/messageController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.use(protect, restrictTo('staff', 'admin'));

router.get('/', getMessages);
router.patch('/:id/status', updateMessageStatus);

module.exports = router;
