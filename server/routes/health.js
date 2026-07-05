const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

/**
 * GET /health
 * Returns server and DB status. Required by Railway/Render for
 * zero-downtime deploys and health-check probes.
 */
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbConnected = dbState === 1;

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    uptime: Math.floor(process.uptime()),
    dbConnected,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
