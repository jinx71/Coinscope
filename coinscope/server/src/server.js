require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const authRoutes = require('./routes/auth');
const coinRoutes = require('./routes/coins');
const portfolioRoutes = require('./routes/portfolio');
const watchlistRoutes = require('./routes/watchlist');

const app = express();

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
    // Expose cache-introspection headers so the React app can read them.
    exposedHeaders: ['X-Cache', 'X-Cache-TTL', 'X-Data-Source'],
  })
);

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Global rate-limit on our own API surface. The backend cache absorbs upstream
// load; this just keeps any one client from hammering us.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.', errors: [] },
});
app.use('/api', limiter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      time: new Date().toISOString(),
      mock: String(process.env.USE_MOCK_DATA || '').toLowerCase() === 'true',
    },
    message: 'CoinScope API up',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[coinscope] API listening on http://localhost:${PORT}`);
    if (String(process.env.USE_MOCK_DATA || '').toLowerCase() === 'true') {
      console.log('[coinscope] USE_MOCK_DATA=true — serving deterministic mock prices.');
    }
  });
};

start();

module.exports = app;
