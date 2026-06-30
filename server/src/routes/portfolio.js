const express = require('express');
const { body } = require('express-validator');
const c = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', c.list);

router.post(
  '/',
  [
    body('coinId').trim().isLength({ min: 1 }).withMessage('coinId required'),
    body('amount').isFloat({ gt: 0 }).withMessage('amount must be > 0'),
    body('avgBuyPrice').isFloat({ gte: 0 }).withMessage('avgBuyPrice must be >= 0'),
    body('symbol').optional().isString(),
    body('name').optional().isString(),
    body('image').optional().isString(),
    body('buyDate').optional().isISO8601().withMessage('buyDate must be ISO 8601'),
    body('notes').optional().isLength({ max: 280 }),
  ],
  c.create
);

router.put(
  '/:id',
  [
    body('amount').optional().isFloat({ gt: 0 }),
    body('avgBuyPrice').optional().isFloat({ gte: 0 }),
    body('buyDate').optional().isISO8601(),
    body('notes').optional().isLength({ max: 280 }),
  ],
  c.update
);

router.delete('/:id', c.remove);

module.exports = router;
