const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies JWT, attaches the live user document to req.user.
// Rejects deactivated accounts even if the token itself is still valid —
// without this check, deactivating a staff account does nothing until
// their token naturally expires.
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({ status: 'fail', message: 'User no longer exists.' });
    }

    if (!currentUser.isActive) {
      return res.status(403).json({ status: 'fail', message: 'Account has been deactivated.' });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({ status: 'fail', message: 'Invalid or expired token.' });
  }
};

// Usage: router.get('/', protect, restrictTo('admin', 'staff'), handler)
exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: `Role '${req.user?.role}' is not permitted to perform this action.`,
      });
    }
    next();
  };
};
