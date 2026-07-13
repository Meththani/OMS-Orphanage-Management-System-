const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ status: 'fail', message: 'Username and password are required.' });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect username or password.' });
    }

    if (user.isLocked()) {
      return res.status(423).json({
        status: 'fail',
        message: 'Account temporarily locked due to repeated failed login attempts.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ status: 'fail', message: 'Account has been deactivated.' });
    }

    const isCorrect = await user.comparePassword(password);
    if (!isCorrect) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      }
      await user.save();
      return res.status(401).json({ status: 'fail', message: 'Incorrect username or password.' });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = signToken(user);
    res.status(200).json({
      status: 'success',
      token,
      user: { id: user._id, name: user.name, role: user.role, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/auth/register — admin only (enforced in authRoutes.js)
exports.register = async (req, res) => {
  try {
    const { name, DOB, username, password, role, contactDetails, nic, jobRole, department } = req.body;

    if (!['admin', 'staff', 'accountant', 'donor'].includes(role)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid role.' });
    }

    if (role !== 'donor') {
      if (!contactDetails || !/^\d{10}$/.test(contactDetails)) {
        return res.status(400).json({ status: 'fail', message: 'Phone number must be exactly 10 digits.' });
      }
      if (!nic || (nic.length !== 10 && nic.length !== 12)) {
        return res.status(400).json({ status: 'fail', message: 'NIC must be either 10 characters (old format) or 12 characters (new format).' });
      }
    }

    const lowerUsername = username ? username.toLowerCase().trim() : '';
    const existing = await User.findOne({ username: lowerUsername });
    if (existing) {
      return res.status(409).json({ status: 'fail', message: 'Username already exists.' });
    }

    if (role !== 'donor' && nic) {
      const existingNic = await User.findOne({ nic: nic.trim() });
      if (existingNic) {
        return res.status(409).json({ status: 'fail', message: 'Staff member with this NIC already exists.' });
      }
    }

    const newUser = await User.create({
      name,
      DOB,
      username: lowerUsername,
      password,
      role,
      contactDetails,
      nic: nic ? nic.trim() : undefined,
      jobRole,
      department,
    });

    res.status(201).json({
      status: 'success',
      data: { id: newUser._id, name: newUser.name, role: newUser.role, username: newUser.username },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/auth/update-credentials — Protected, update user's own username and password
exports.updateCredentials = async (req, res) => {
  try {
    const { username, password, newPassword } = req.body;
    if (!password) {
      return res.status(400).json({ status: 'fail', message: 'Current password is required to save changes.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    // Verify current password
    const isCorrect = await user.comparePassword(password);
    if (!isCorrect) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect current password.' });
    }

    // Update username if requested
    if (username && username.trim() !== '') {
      const lowerUsername = username.toLowerCase().trim();
      if (lowerUsername !== user.username) {
        const existing = await User.findOne({ username: lowerUsername });
        if (existing) {
          return res.status(409).json({ status: 'fail', message: 'Username already exists.' });
        }
        user.username = lowerUsername;
      }
    }

    // Update password if newPassword is provided
    if (newPassword && newPassword.trim() !== '') {
      if (newPassword.length < 8) {
        return res.status(400).json({ status: 'fail', message: 'New password must be at least 8 characters long.' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Credentials updated successfully.',
      user: { id: user._id, name: user.name, role: user.role, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
