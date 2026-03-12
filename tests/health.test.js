import request from 'supertest';
import app from '../src/app.js';

describe('Health endpoint', () => {
  it('GET /health returns 200 and status ok', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
