import request from 'supertest';
import app from '../src/app.js';

describe('Authentication protection', () => {
  it('GET /users/conversions returns 401 without token', async () => {
    const response = await request(app).get('/users/conversions');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'Access denied. Missing token.',
      code: 'UNAUTHORIZED',
    });
  });
});
