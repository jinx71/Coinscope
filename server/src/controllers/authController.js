const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    fail(res, 'Validation failed', 400, errors.array());
    return false;
  }
  return true;
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  if (!validate(req, res)) return;
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return fail(res, 'Email already registered', 409);

  const user = await User.create({ name, email, password });
  const token = user.signToken();

  return ok(
    res,
    { token, user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt } },
    'Registered',
    201
  );
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  if (!validate(req, res)) return;
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) return fail(res, 'Invalid credentials', 401);

  const match = await user.matchPassword(password);
  if (!match) return fail(res, 'Invalid credentials', 401);

  const token = user.signToken();
  return ok(res, {
    token,
    user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
  });
});

// GET /api/auth/me  (protected)
const me = asyncHandler(async (req, res) => {
  return ok(res, { user: req.user });
});

module.exports = { register, login, me };
