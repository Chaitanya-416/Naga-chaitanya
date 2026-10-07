import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('Auth Endpoints & Protection Middleware', () => {
  const app = createApp();

  it('POST /api/v1/auth/session returns 400 on malformed email or short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/session')
      .send({ email: 'not-an-email', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  it('POST /api/v1/auth/session establishes a valid session', async () => {
    const res = await request(app)
      .post('/api/v1/auth/session')
      .send({ email: 'secops@scopeseal.test', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe('secops@scopeseal.test');
  });

  it('GET /api/v1/auth/me rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('GET /api/v1/auth/me succeeds with valid bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer demo-token-test-12345');

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('email');
  });
});
