const express = require('express');
const c = require('../controllers/coinController');

const router = express.Router();

// Specific paths before the wildcard :id route
router.get('/markets', c.getMarkets);
router.get('/trending', c.getTrending);
router.get('/global', c.getGlobal);
router.get('/search', c.search);
router.get('/cache/stats', c.cacheStats);

router.get('/:id/chart', c.getChart);
router.get('/:id', c.getCoin);

module.exports = router;
