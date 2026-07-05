const Message = require('../models/Message');

// GET /api/messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort('-createdAt');
    res.status(200).json({ status: 'success', data: messages });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/messages/:id/status
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'read', 'archived'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid status value.' });
    }

    const message = await Message.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!message) {
      return res.status(404).json({ status: 'fail', message: 'Message not found.' });
    }

    res.status(200).json({ status: 'success', data: message });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
