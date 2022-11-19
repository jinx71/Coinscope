const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { fail } = require('../utils/apiResponse');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) token = header.slice(7);

  if (!token) return fail(res, 'Not authenticated', 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return fail(res, 'Invalid or expired token', 401);
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) return fail(res, 'User no longer exists', 401);

  req.user = user;
  next();
});

module.exports = { protect };
