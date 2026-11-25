import { afterEach, describe, expect, it } from 'vitest';
import { signSessionToken, verifySessionToken } from '../../server/middleware/auth.ts';

const originalNodeEnv = process.env.NODE_ENV;
const originalAuthSecret = process.env.AUTH_SECRET;

afterEach(() => {
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  if (originalAuthSecret === undefined) delete process.env.AUTH_SECRET;
  else process.env.AUTH_SECRET = originalAuthSecret;
});

describe('session token configuration', () => {
  it('rejects a missing or weak secret in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.AUTH_SECRET = 'short-secret';

    expect(() => signSessionToken({
      sub: 'user-id',
      email: 'student@example.com',
      role: 'student',
      name: 'Student',
    })).toThrow('AUTH_SECRET must be configured with at least 32 characters in production.');
  });

  it('verifies tokens with a configured production secret', () => {
    process.env.NODE_ENV = 'production';
    process.env.AUTH_SECRET = 'a'.repeat(32);
    const payload = {
      sub: 'user-id',
      email: 'student@example.com',
      role: 'student' as const,
      name: 'Student',
    };

    expect(verifySessionToken(signSessionToken(payload))).toMatchObject(payload);
  });
});
