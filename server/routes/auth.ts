import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Router } from 'express';
import { connectToDatabase, isDatabaseConfigured } from '../config/db.ts';
import {
  clearSessionCookie,
  createRateLimiter,
  requireAuth,
  setSessionCookie,
  signSessionToken,
  type AuthenticatedRequest,
} from '../middleware/auth.ts';
import {
  AdminLogModel,
  ProfileModel,
  RoadmapProgressModel,
  SystemConfigModel,
  UserModel,
} from '../models/index.ts';
import { generateDeterministicRoadmap } from '../../src/lib/careerRoles.ts';
import { loginSchema, registerSchema } from '../../src/lib/validation.ts';
import type { UserRole } from '../../src/types/index.ts';

const router = Router();
const authRateLimit = createRateLimiter(30, 15 * 60 * 1000);

function timingSafeStringMatch(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

router.post('/register', authRateLimit, async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({
      error: 'Database is not configured yet. Add MONGODB_URI to environment secrets.',
    });
    return;
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues[0]?.message || 'Invalid registration data.',
    });
    return;
  }

  try {
    await connectToDatabase();
    const email = parsed.data.email.toLowerCase();
    const existing = await UserModel.findOne({ email }).lean();
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    // Always enforce student role on public registration
    const user = await UserModel.create({
      name: parsed.data.name,
      email,
      passwordHash,
      role: 'student',
    });

    await ProfileModel.create({
      userId: user._id,
      name: user.name,
      email: user.email,
      technicalSkills: ['HTML', 'CSS', 'JavaScript', 'Git'],
      programmingLanguages: ['JavaScript', 'Python'],
      careerInterests: ['Full Stack Development', 'Data Analytics'],
      targetRole: 'Full Stack Developer',
    });

    const initialRoadmap = generateDeterministicRoadmap('Full Stack Developer', [
      'HTML',
      'CSS',
      'JavaScript',
      'Git',
    ]);
    await RoadmapProgressModel.create({
      userId: user._id,
      targetRole: initialRoadmap.targetRole,
      tasks: initialRoadmap.tasks,
    });

    const token = signSessionToken({
      sub: String(user._id),
      email: user.email,
      role: 'student',
      name: user.name,
    });
    setSessionCookie(req, res, token);

    res.status(201).json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: 'student',
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to complete registration. Please try again.' });
  }
});

router.post('/login', authRateLimit, async (req, res) => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({
      error: 'Database is not configured yet. Add MONGODB_URI to environment secrets.',
    });
    return;
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid credentials.' });
    return;
  }

  try {
    await connectToDatabase();
    const email = parsed.data.email.toLowerCase();
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signSessionToken({
      sub: String(user._id),
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
    });
    setSessionCookie(req, res, token);

    res.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to sign in. Please try again.' });
  }
});

router.post('/logout', (req, res) => {
  clearSessionCookie(req, res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

router.get('/admin-status', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    await connectToDatabase();
    const envConfigured = Boolean(process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim().length > 0);
    const configDoc = await SystemConfigModel.findOne({ key: 'admin_claim' }).lean();
    const adminCount = await UserModel.countDocuments({ role: 'admin' });
    res.json({
      envPasscodeConfigured: envConfigured,
      firstRunClaimAvailable: !envConfigured && !configDoc && adminCount === 0,
      hasAdminUser: adminCount > 0,
      isCurrentUserAdmin: req.user?.role === 'admin',
    });
  } catch (err) {
    console.error('Admin status error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Unable to check administrator configuration.' });
  }
});

router.post('/claim-admin', authRateLimit, requireAuth, async (req: AuthenticatedRequest, res) => {
  const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
  if (passcode.length < 8) {
    res.status(400).json({ error: 'Administrator passcode must be at least 8 characters.' });
    return;
  }

  try {
    await connectToDatabase();
    const envPasscode = process.env.ADMIN_PASSCODE?.trim();

    if (envPasscode && envPasscode.length > 0) {
      if (!timingSafeStringMatch(passcode, envPasscode)) {
        res.status(403).json({ error: 'Invalid administrator passcode.' });
        return;
      }
    } else {
      const existingConfig = await SystemConfigModel.findOne({ key: 'admin_claim' });
      const adminCount = await UserModel.countDocuments({ role: 'admin' });

      if (!existingConfig && adminCount === 0) {
        const hash = await bcrypt.hash(passcode, 12);
        await SystemConfigModel.create({
          key: 'admin_claim',
          adminPasscodeHash: hash,
          claimedByUserId: req.user!.id,
        });
      } else if (existingConfig) {
        const ok = await bcrypt.compare(passcode, existingConfig.adminPasscodeHash);
        if (!ok) {
          res.status(403).json({ error: 'Invalid administrator passcode.' });
          return;
        }
      } else {
        res.status(403).json({
          error: 'Administrator access is already claimed. Configure ADMIN_PASSCODE to promote additional accounts.',
        });
        return;
      }
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user!.id,
      { role: 'admin' },
      { returnDocument: 'after' }
    );
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    await AdminLogModel.create({
      actorId: updatedUser._id,
      action: 'ADMIN_ROLE_ACTIVATED',
      targetType: 'User',
      summary: 'Administrator access verified and activated.',
    });

    const token = signSessionToken({
      sub: String(updatedUser._id),
      email: updatedUser.email,
      role: 'admin',
      name: updatedUser.name,
    });
    setSessionCookie(req, res, token);

    res.json({
      user: {
        id: String(updatedUser._id),
        name: updatedUser.name,
        email: updatedUser.email,
        role: 'admin',
      },
      token,
    });
  } catch (err) {
    console.error('Claim admin error:', err instanceof Error ? err.message : err);
    res.status(500).json({ error: 'Failed to process administrator verification.' });
  }
});

export default router;
