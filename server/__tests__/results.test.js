const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request  = require('supertest');
const app      = require('../index');

let mongod;

// ─── Setup / Teardown ─────────────────────────────────────────────────────────
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  // Clear DB between tests for isolation
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ─── Test Suite ───────────────────────────────────────────────────────────────
describe('POST /api/results', () => {
  const validBody = {
    scores: { culture: 8, worklife: 7, tech: 9, growth: 6 },
    offerIndex: 82,
    name: 'Acme Corp',
  };

  it('201 — saves valid scores and returns a slug', async () => {
    const res = await request(app).post('/api/results').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('slug');
    expect(typeof res.body.slug).toBe('string');
    expect(res.body.slug.length).toBeGreaterThan(4);
  });

  it('400 — rejects missing scores object', async () => {
    const res = await request(app).post('/api/results').send({ name: 'No Scores Corp' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('400 — rejects out-of-range score values', async () => {
    const res = await request(app).post('/api/results').send({
      scores: { culture: 15, worklife: 7, tech: 9, growth: 6 }, // 15 > max 10
    });
    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });
});

describe('GET /api/results/:slug', () => {
  it('200 — returns stored scores for a valid slug', async () => {
    // First save a result
    const post = await request(app).post('/api/results').send({
      scores: { culture: 9, worklife: 8, tech: 10, growth: 7 },
    });
    const { slug } = post.body;

    const res = await request(app).get(`/api/results/${slug}`);
    expect(res.status).toBe(200);
    expect(res.body.scores.culture).toBe(9);
    expect(res.body.scores.tech).toBe(10);
  });

  it('404 — returns 404 for an unknown slug', async () => {
    const res = await request(app).get('/api/results/nonexistentslug99');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/results/counter', () => {
  it('200 — returns count of 0 on empty DB', async () => {
    const res = await request(app).get('/api/results/counter');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('count');
    expect(res.body.count).toBe(0);
  });

  it('200 — count increments after a submission', async () => {
    await request(app).post('/api/results').send({
      scores: { culture: 5, worklife: 5, tech: 5, growth: 5 },
    });
    const res = await request(app).get('/api/results/counter');
    expect(res.body.count).toBe(1);
  });
});

describe('GET /health', () => {
  it('200 — returns ok status and uptime', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body.dbConnected).toBe(true);
  });
});

describe('GET /api/results/leaderboard', () => {
  it('200 — returns empty leaderboard array on empty DB', async () => {
    const res = await request(app).get('/api/results/leaderboard');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.leaderboard)).toBe(true);
    expect(res.body.leaderboard.length).toBe(0);
  });

  it('200 — returns top results sorted by total score descending', async () => {
    // Submit two results with different scores
    await request(app).post('/api/results').send({
      scores: { culture: 5, worklife: 5, tech: 5, growth: 5 }, // total 20
      name: 'Low Corp',
    });
    await request(app).post('/api/results').send({
      scores: { culture: 9, worklife: 9, tech: 9, growth: 9 }, // total 36
      name: 'Top Corp',
    });

    const res = await request(app).get('/api/results/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body.leaderboard[0].name).toBe('Top Corp');
    expect(res.body.leaderboard[0].total).toBe(36);
  });
});
