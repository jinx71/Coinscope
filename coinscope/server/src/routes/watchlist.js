const express = require('express');
const { body } = require('express-validator');
const c = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', c.list);

router.post(
  '/',
  [
    body('coinId').trim().isLength({ min: 1 }).withMessage('coinId required'),
    body('symbol').optional().isString(),
    body('name').optional().isString(),
    body('image').optional().isString(),
  ],
  c.add
);

router.delete('/:coinId', c.remove);

module.exports = router;
