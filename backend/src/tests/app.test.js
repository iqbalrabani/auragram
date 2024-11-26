const request = require('supertest');
const app = require('../index');

describe('Basic Application Tests', () => {
  it('should respond to health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });
});