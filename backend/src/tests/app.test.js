const request = require('supertest');
const app = require('../index');

describe('Basic Application Tests', () => {
  it('should respond to health check', async () => {
    // Add health endpoint test
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  // Add a basic route to index.js for testing
  afterAll(done => {
    done();
  });
});