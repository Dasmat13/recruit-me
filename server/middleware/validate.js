const Joi = require('joi');

const scoreField = Joi.number().integer().min(0).max(10).required();

const resultSchema = Joi.object({
  scores: Joi.object({
    culture:  scoreField,
    worklife: scoreField,
    tech:     scoreField,
    growth:   scoreField,
  }).required(),
  offerIndex: Joi.number().min(0).max(100).optional().allow(null),
  name: Joi.string().max(60).optional().allow(''),
  role: Joi.string().valid('fullstack', 'devops', 'pm').optional(),
  recruiterFeedback: Joi.array().items(Joi.string()).optional(),
});

/**
 * Express middleware — validates POST /api/results body.
 * Returns 400 with a descriptive error message on failure.
 */
function validateResult(req, res, next) {
  const { error, value } = resultSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: error.details.map((d) => d.message),
    });
  }
  req.body = value; // use sanitised value
  next();
}

module.exports = { validateResult };
