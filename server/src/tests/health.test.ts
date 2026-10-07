import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('Health & Readiness Endpoints', () => {
  const app = createApp();

  it('GET /api/v1/health returns status 200 with service information', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pass');
    expect(res.body.service).toContain('ScopeSeal AI');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/v1/ready returns status 200 with comprehensive subsystem health', async () => {
    const res = await request(app).get('/api/v1/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body).toHaveProperty('subsystems');
    expect(res.body.subsystems.api.status).toBe('pass');
    expect(res.body.subsystems.policyEngine.status).toBe('pass');
    expect(res.body.subsystems.ledgerSubsystem.status).toBe('pass');
  });
});
