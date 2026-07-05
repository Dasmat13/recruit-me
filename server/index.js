require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const morgan   = require('morgan');

const healthRouter  = require('./routes/health');
const resultsRouter = require('./routes/results');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '10kb' })); // reject giant payloads

// Morgan structured JSON logging (DevOps maturity signal)
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/health',       healthRouter);
app.use('/api/results',  resultsRouter);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('[Unhandled error]', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── Database + Boot ─────────────────────────────────────────────────────────
async function start() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/recruitme';

  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[DB] Connected to MongoDB`);
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`[Server] Recruit Me API running on http://localhost:${PORT}`);
    console.log(`[Server] Health check → http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received — shutting down gracefully');
    server.close(() => mongoose.connection.close());
  });
}

// Only boot when run directly (not during tests)
if (require.main === module) {
  start();
}

module.exports = app; // exported for supertest
