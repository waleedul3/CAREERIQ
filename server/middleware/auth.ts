import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../config/db.ts';
import { UserModel } from '../models/index.ts';
import type { UserRole } from '../../src/types/index.ts';

// Ephemeral fallback ensures local/preview works without hardcoded secrets in repo
const EPHEMERAL_FALLBACK_SECRET = crypto.randomBytes(32).toString('hex');

export const SESSION_COOKIE_NAME = 'careeriq_session';

function getSigningSecret(): string {
  const configured = process.env.AUTH_SECRET?.trim();
  if (configured && configured.length >= 32) return configured;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET must be configured with at least 32 characters in production.');
  }
  return EPHEMERAL_FALLBACK_SECRET;
}

export interface SessionTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export function signSessionToken(payload: SessionTokenPayload): string {
  return jwt.sign(payload, getSigningSecret(), {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
}

export function verifySessionToken(token: string): SessionTokenPayload | null {
  const secret = getSigningSecret();
  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as SessionTokenPayload;
    if (!decoded || typeof decoded.sub !== 'string') return null;
    return decoded;
  } catch {
    return null;
  }
}

export function setSessionCookie(req: Request, res: Response, token: string): void {
  const isHttps =
    req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';

  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${7 * 24 * 60 * 60}`,
  ];
  if (isHttps) {
    parts.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    parts.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(req: Request, res: Response): void {
  const isHttps =
    req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === 'production';

  const parts = [`${SESSION_COOKIE_NAME}=`, 'Path=/', 'HttpOnly', 'Max-Age=0'];
  if (isHttps) {
    parts.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    parts.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

function isMutatingMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

function verifyCsrfIfCookieAuth(req: Request): boolean {
  if (!isMutatingMethod(req.method)) return true;
  const customHeader = req.headers['x-requested-with'];
  if (customHeader === 'CareerIQ') return true;

  const origin = req.headers.origin;
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  let token: string | undefined;
  let usedCookie = false;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.cookies && typeof req.cookies[SESSION_COOKIE_NAME] === 'string') {
    token = req.cookies[SESSION_COOKIE_NAME];
    usedCookie = true;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  if (usedCookie && !verifyCsrfIfCookieAuth(req)) {
    res.status(403).json({ error: 'CSRF validation failed for cookie-authenticated request.' });
    return;
  }

  let payload: SessionTokenPayload | null;
  try {
    payload = verifySessionToken(token);
  } catch (err) {
    console.error('Auth configuration error:', err instanceof Error ? err.message : err);
    res.status(503).json({ error: 'Authentication is temporarily unavailable.' });
    return;
  }
  if (!payload) {
    res.status(401).json({ error: 'Session is invalid or expired. Please sign in again.' });
    return;
  }

  try {
    await connectToDatabase();
    // Re-read role & existence from DB so role changes or deletions take effect immediately
    const userDoc = await UserModel.findById(payload.sub).select('name email role').lean();
    if (!userDoc) {
      res.status(401).json({ error: 'Account no longer exists.' });
      return;
    }

    req.user = {
      id: String(userDoc._id),
      email: String(userDoc.email),
      role: userDoc.role as UserRole,
      name: String(userDoc.name),
    };
    next();
  } catch (err) {
    console.error('Auth lookup error:', err instanceof Error ? err.message : err);
    res.status(503).json({ error: 'Unable to verify session with database.' });
  }
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator authorization required.' });
    return;
  }
  next();
}

// Lightweight in-memory sliding-window rate limiter
const rateBuckets = new Map<string, number[]>();

export function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.baseUrl}${req.path}:${ip}`;
    const now = Date.now();
    const recent = (rateBuckets.get(key) || []).filter((ts) => now - ts < windowMs);

    if (recent.length >= maxRequests) {
      res.status(429).json({
        error: 'Too many requests. Please wait a moment before trying again.',
      });
      return;
    }

    recent.push(now);
    rateBuckets.set(key, recent);
    next();
  };
}
