const User = require('../models/User');

// GET /api/staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['admin', 'staff', 'accountant'] } });
    res.status(200).json({ status: 'success', results: staff.length, data: staff });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/staff/:id
exports.getStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff) return res.status(404).json({ status: 'fail', message: 'Staff member not found.' });
    res.status(200).json({ status: 'success', data: staff });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/staff/:id
// Password and role are deliberately excluded here — changing them goes
// through dedicated, more tightly-guarded flows (password reset, role
// change) so a generic "update profile" call can't be used for privilege
// escalation.
exports.updateStaff = async (req, res) => {
  try {
    const body = { ...req.body };

    // Format username if provided
    if (body.username) {
      body.username = body.username.toLowerCase().trim();
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ username: body.username, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(409).json({ status: 'fail', message: 'Username already exists.' });
      }
    }

    // Handle password update if provided
    if (body.password) {
      if (body.password.length < 8) {
        return res.status(400).json({ status: 'fail', message: 'Password must be at least 8 characters long.' });
      }
      const bcrypt = require('bcrypt');
      body.password = await bcrypt.hash(body.password, 12);
    } else {
      delete body.password;
    }

    const staff = await User.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!staff) return res.status(404).json({ status: 'fail', message: 'Staff member not found.' });
    res.status(200).json({ status: 'success', data: staff });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/staff/:id/deactivate
// Soft delete only — never hard-delete staff/user records. You need the
// audit trail (who touched which child/donation record) intact even after
// someone leaves.
exports.deactivateStaff = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ status: 'fail', message: 'You cannot deactivate your own admin account.' });
    }
    const staff = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!staff) return res.status(404).json({ status: 'fail', message: 'Staff member not found.' });
    res.status(200).json({ status: 'success', message: 'Staff account deactivated.', data: staff });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/staff/:id/reactivate
exports.reactivateStaff = async (req, res) => {
  try {
    const staff = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!staff) return res.status(404).json({ status: 'fail', message: 'Staff member not found.' });
    res.status(200).json({ status: 'success', message: 'Staff account reactivated.', data: staff });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/staff/:id
exports.deleteStaff = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ status: 'fail', message: 'You cannot delete your own admin account.' });
    }
    const staff = await User.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ status: 'fail', message: 'Staff member not found.' });
    res.status(200).json({ status: 'success', message: 'Staff member deleted successfully.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
