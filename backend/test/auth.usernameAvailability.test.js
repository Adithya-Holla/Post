import request from 'supertest';
import bcrypt from 'bcrypt';

import app from '../src/app.js';
import User from '../src/models/User.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './_setup.js';

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

describe('Username availability', () => {
  it('returns available=false when username exists', async () => {
    const passwordHash = await bcrypt.hash('Pass123!', 10);
    await User.create({ username: 'takenname', email: 't@example.com', passwordHash });

    const res = await request(app)
      .get('/api/auth/check-username')
      .query({ username: 'takenname' });

    expect(res.status).toBe(200);
    expect(res.body.available).toBe(false);
  });

  it('returns available=true when username is free', async () => {
    const res = await request(app)
      .get('/api/auth/check-username')
      .query({ username: 'freen' });

    expect(res.status).toBe(200);
    expect(res.body.available).toBe(true);
  });

  it('returns available=false with reason=invalid for short usernames', async () => {
    const res = await request(app)
      .get('/api/auth/check-username')
      .query({ username: 'ab' });

    expect(res.status).toBe(200);
    expect(res.body.available).toBe(false);
    expect(res.body.reason).toBe('invalid');
  });
});
