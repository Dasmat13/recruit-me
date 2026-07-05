const express = require('express');
const crypto  = require('crypto');
const Result  = require('../models/Result');
const { postLimiter, getLimiter } = require('../middleware/rateLimiter');
const { validateResult } = require('../middleware/validate');

const router = express.Router();

// ─── Helper: fire Discord webhook (non-blocking) ──────────────────────────────
async function notifyDiscord(result) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const total = result.scores.culture + result.scores.worklife +
                result.scores.tech    + result.scores.growth;
  if (total < 30) return; // only notify on high scores (≥75%)

  const verdictEmoji = total >= 32 ? '✅' : '⚠️';
  const payload = {
    embeds: [{
      title: `${verdictEmoji} New High-Score Recruiter!`,
      description: `A recruiter just scored **${total}/40** on the assessment.`,
      color: total >= 32 ? 0x00e87e : 0xf5e642,
      fields: [
        { name: 'Company Culture', value: `${result.scores.culture}/10`, inline: true },
        { name: 'Work-Life',       value: `${result.scores.worklife}/10`, inline: true },
        { name: 'Tech Env',        value: `${result.scores.tech}/10`, inline: true },
        { name: 'Growth & Comp',   value: `${result.scores.growth}/10`, inline: true },
        { name: 'Offer Index',     value: result.offerIndex != null ? `${result.offerIndex}%` : 'N/A', inline: true },
        { name: 'Name',            value: result.name || 'Anonymous', inline: true },
      ],
      footer: { text: 'Recruit Me If You Can — dasmat.dev' },
      timestamp: new Date().toISOString(),
    }],
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Non-blocking: log but don't fail the request
    console.error('[Discord webhook] Failed to send:', err.message);
  }
}

// ─── POST /api/results ────────────────────────────────────────────────────────
// Save assessment scores → return shareable slug
router.post('/', postLimiter, validateResult, async (req, res) => {
  try {
    const slug = crypto.randomUUID().split('-')[0] +
                 crypto.randomUUID().split('-')[0]; // ~12 hex chars

    const result = await Result.create({
      slug,
      scores:     req.body.scores,
      offerIndex: req.body.offerIndex ?? null,
      name:       req.body.name?.trim() || 'Anonymous',
      role:       req.body.role || 'fullstack',
      recruiterFeedback: req.body.recruiterFeedback || [],
    });

    // Fire-and-forget Discord alert
    notifyDiscord(result);

    res.status(201).json({ slug });
  } catch (err) {
    console.error('[POST /api/results]', err.message);
    res.status(500).json({ error: 'Failed to save result.' });
  }
});

// ─── GET /api/results/counter ────────────────────────────────────────────────
// Total number of assessments ever taken
router.get('/counter', getLimiter, async (req, res) => {
  try {
    const count = await Result.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('[GET /api/results/counter]', err.message);
    res.status(500).json({ error: 'Failed to fetch counter.' });
  }
});

// ─── GET /api/results/leaderboard ────────────────────────────────────────────
// Top 10 results by total score (descending)
router.get('/leaderboard', getLimiter, async (req, res) => {
  try {
    const results = await Result.find().lean();

    // Compute total in JS (MongoDB can't sort by virtual)
    const ranked = results
      .map((r) => ({
        name:       r.name,
        scores:     r.scores,
        offerIndex: r.offerIndex,
        role:       r.role || 'fullstack',
        recruiterFeedback: r.recruiterFeedback || [],
        total:      r.scores.culture + r.scores.worklife + r.scores.tech + r.scores.growth,
        createdAt:  r.createdAt,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    res.json({ leaderboard: ranked });
  } catch (err) {
    console.error('[GET /api/results/leaderboard]', err.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

// ─── GET /api/results/:slug ───────────────────────────────────────────────────
// Fetch a stored result by its slug
router.get('/:slug', getLimiter, async (req, res) => {
  try {
    const result = await Result.findOne({ slug: req.params.slug }).lean();
    if (!result) {
      return res.status(404).json({ error: 'Result not found or has expired.' });
    }
    res.json({
      scores:     result.scores,
      offerIndex: result.offerIndex,
      name:       result.name,
      role:       result.role || 'fullstack',
      recruiterFeedback: result.recruiterFeedback || [],
      createdAt:  result.createdAt,
    });
  } catch (err) {
    console.error('[GET /api/results/:slug]', err.message);
    res.status(500).json({ error: 'Failed to fetch result.' });
  }
});


module.exports = router;
