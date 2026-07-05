const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  scores: {
    culture:  { type: Number, required: true, min: 0, max: 10 },
    worklife: { type: Number, required: true, min: 0, max: 10 },
    tech:     { type: Number, required: true, min: 0, max: 10 },
    growth:   { type: Number, required: true, min: 0, max: 10 },
  },
  offerIndex: {
    type: Number,
    default: null,
  },
  name: {
    type: String,
    default: 'Anonymous',
    maxlength: 60,
  },
  role: {
    type: String,
    enum: ['fullstack', 'devops', 'pm'],
    default: 'fullstack',
  },
  recruiterFeedback: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // TTL: auto-delete after 30 days — no cleanup job needed
    expires: 60 * 60 * 24 * 30,
  },
});

// Virtual: total score
resultSchema.virtual('total').get(function () {
  const s = this.scores;
  return s.culture + s.worklife + s.tech + s.growth;
});

module.exports = mongoose.model('Result', resultSchema);
