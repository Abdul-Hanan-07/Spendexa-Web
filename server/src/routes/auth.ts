import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS, signAuthToken } from '../lib/jwt';
import { sendPasswordResetEmail } from '../lib/resend';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
} from '../schemas/auth';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const GENERIC_FORGOT_PASSWORD_MESSAGE =
  "If an account exists for that email, we've sent a link to reset your password.";

function sanitizeUser<T extends { passwordHash: string }>(user: T) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

router.post('/register', authLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { name, email, password, currency } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          ...(currency ? { currency } : {}),
        },
      });

      await tx.account.create({
        data: {
          userId: createdUser.id,
          name: 'Main Account',
          currentBalance: 0,
          totalAssets: 0,
        },
      });

      return createdUser;
    });

    const token = signAuthToken({ userId: user.id });
    res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

    return res.status(201).json({ user: sanitizeUser(user) });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signAuthToken({ userId: user.id });
    res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

    return res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
  return res.status(200).json({ success: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  return res.json({ user: sanitizeUser(user) });
});

router.put('/profile', authLimiter, requireAuth, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { name, email } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== req.userId) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: { name, email },
    });

    return res.json({ user: sanitizeUser(updatedUser) });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.put('/password', authLimiter, requireAuth, async (req, res) => {
  const parsed = updatePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: req.userId },
      data: { passwordHash },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Update password error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/forgot-password', authLimiter, async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { email } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond the same way whether or not the account exists, so this
    // endpoint can't be used to enumerate which emails are registered.
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      });

      try {
        await sendPasswordResetEmail(user.email, token);
      } catch (emailErr) {
        // Don't let a Resend failure change the response shape (same reason
        // as above), but do log it -- otherwise a broken email integration
        // fails completely silently.
        console.error('Failed to send password reset email:', emailErr);
      }
    }

    return res.json({ message: GENERIC_FORGOT_PASSWORD_MESSAGE });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/reset-password', authLimiter, async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }

  const { token, newPassword } = parsed.data;
  const INVALID_TOKEN_MESSAGE = 'This reset link is invalid or has expired. Please request a new one.';

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: INVALID_TOKEN_MESSAGE });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.updateMany({
        where: { userId: resetToken.userId, used: false },
        data: { used: true },
      });
    });

    return res.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
