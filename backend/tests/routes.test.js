const request = require('supertest');
const app = require('../server');
const { close } = require('../src/models/database');

describe('Video Controller', () => {
  afterAll(async () => {
    await close();
  });

  describe('POST /api/videos', () => {
    it('should create a new video job', async () => {
      const res = await request(app)
        .post('/api/videos')
        .send({
          topic: 'How to cook pasta',
          style: 'educational'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('jobId');
      expect(res.body.status).toBe('pending');
    });

    it('should reject missing topic', async () => {
      const res = await request(app)
        .post('/api/videos')
        .send({
          style: 'educational'
        });

      expect(res.status).toBe(400);
    });

    it('should accept valid style parameter', async () => {
      const res = await request(app)
        .post('/api/videos')
        .send({
          topic: 'Test topic',
          style: 'entertainment'
        });

      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/videos', () => {
    it('should list videos with pagination', async () => {
      const res = await request(app)
        .get('/api/videos')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('videos');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.videos)).toBe(true);
    });

    it('should handle pagination parameters', async () => {
      const res = await request(app)
        .get('/api/videos')
        .query({ page: 2, limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});

describe('Error Handling', () => {
  afterAll(async () => {
    await close();
  });

  it('should handle invalid UUID', async () => {
    const res = await request(app)
      .get('/api/videos/invalid-id');

    expect(res.status).toBe(400);
  });

  it('should return 404 for non-existent endpoint', async () => {
    const res = await request(app)
      .get('/api/nonexistent');

    expect(res.status).toBe(404);
  });

  it('should return 404 for non-existent video', async () => {
    const res = await request(app)
      .get('/api/videos/550e8400-e29b-41d4-a716-446655440000');

    expect(res.status).toBe(404);
  });
});
