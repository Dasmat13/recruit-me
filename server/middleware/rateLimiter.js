const rateLimit = require('express-rate-limit');

/**
 * Limits POST /api/results to 30 requests per 15 minutes per IP.
 * Returns a clear 429 JSON response on breach.
 */
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many submissions from this IP. Please wait 15 minutes and try again.',
  },
});

/**
 * Lenient limiter for read-only GET routes (counter, leaderboard).
 */
const getLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Slow down.',
  },
});

module.exports = { postLimiter, getLimiter };
