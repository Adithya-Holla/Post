import request from 'supertest';
import bcrypt from 'bcrypt';

import app from '../src/app.js';
import User from '../src/models/User.js';
import { mailerTestState } from '../src/utils/mailer.js';
import { connectTestDb, disconnectTestDb, clearTestDb } from './_setup.js';

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
});

beforeEach(async () => {
  mailerTestState.last = null;
  await clearTestDb();
});

describe('Forgot/reset password flow', () => {
  it('does not reveal whether an email exists', async () => {
    const passwordHash = await bcrypt.hash('OldPass123!', 10);
    await User.create({ username: 'alice', email: 'alice@example.com', passwordHash });

    const resExisting = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'alice@example.com' });

    const resMissing = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'missing@example.com' });

    expect(resExisting.status).toBe(200);
    expect(resMissing.status).toBe(200);
    expect(resExisting.body.message).toBe(resMissing.body.message);
  });

  it('stores only a hashed reset token, and allows a single successful reset', async () => {
    const passwordHash = await bcrypt.hash('OldPass123!', 10);
    await User.create({ username: 'bob', email: 'bob@example.com', passwordHash });

    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'bob@example.com' });

    expect(forgotRes.status).toBe(200);
    expect(mailerTestState.last?.to).toBe('bob@example.com');
    expect(mailerTestState.last?.resetUrl).toMatch(/\/reset-password\//);

    const token = mailerTestState.last.resetUrl.split('/').pop();
    expect(token).toBeTruthy();

    const userWithReset = await User.findOne({ email: 'bob@example.com' }).select(
      '+resetPasswordTokenHash +resetPasswordTokenExpiresAt'
    );

    expect(userWithReset.resetPasswordTokenHash).toBeTruthy();
    expect(userWithReset.resetPasswordTokenHash).not.toBe(token);
    expect(userWithReset.resetPasswordTokenExpiresAt).toBeInstanceOf(Date);

    const ttlMs = userWithReset.resetPasswordTokenExpiresAt.getTime() - Date.now();
    expect(ttlMs).toBeGreaterThan(14 * 60 * 1000);
    expect(ttlMs).toBeLessThan(15 * 60 * 1000 + 5000);

    const resetRes = await request(app)
      .post(`/api/auth/reset-password/${token}`)
      .send({ password: 'NewPass123!' });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.message).toBe('Password reset successful');

    // Old password should fail
    const loginOld = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@example.com', password: 'OldPass123!' });
    expect(loginOld.status).toBe(401);

    // New password should work
    const loginNew = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@example.com', password: 'NewPass123!' });
    expect(loginNew.status).toBe(200);

    // Token should be single-use
    const resetAgain = await request(app)
      .post(`/api/auth/reset-password/${token}`)
      .send({ password: 'AnotherPass123!' });

    expect(resetAgain.status).toBe(400);
    expect(resetAgain.body.message).toBe('Invalid or expired reset token');
  });

  it('clears the auth cookie on password reset', async () => {
    const passwordHash = await bcrypt.hash('OldPass123!', 10);
    await User.create({ username: 'carol', email: 'carol@example.com', passwordHash });

    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'carol@example.com' });

    const token = mailerTestState.last.resetUrl.split('/').pop();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'carol@example.com', password: 'OldPass123!' });

    const cookie = (loginRes.headers['set-cookie'] || []).find((c) => c.startsWith('token='));
    expect(cookie).toBeTruthy();

    const resetRes = await request(app)
      .post(`/api/auth/reset-password/${token}`)
      .set('Cookie', cookie)
      .send({ password: 'NewPass123!' });

    expect(resetRes.status).toBe(200);

    const cleared = (resetRes.headers['set-cookie'] || []).some(
      (c) => c.startsWith('token=') && (c.includes('Expires=') || c.toLowerCase().includes('max-age=0'))
    );
    expect(cleared).toBe(true);
  });
});
