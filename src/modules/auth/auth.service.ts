import { Request } from 'express';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/utils/AppError';
import { verifyPassword } from '@/utils/password';
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
  generateCsrfToken,
  AccessTokenPayload,
} from '@/utils/tokens';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: AccessTokenPayload['role'];
    organizationId: string;
  };
}

interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

async function issueSession(
  userId: string,
  organizationId: string,
  role: AccessTokenPayload['role'],
  email: string,
  firstName: string,
  lastName: string,
  meta: RequestMeta,
): Promise<SessionTokens> {
  const accessToken = signAccessToken({ sub: userId, organizationId, role });
  const refreshToken = generateRefreshToken();
  const csrfToken = generateCsrfToken();

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      ...meta, // spread, not explicit undefined — exactOptionalPropertyTypes bites otherwise, see extractRequestMeta below
    },
  });

  return {
    accessToken,
    refreshToken,
    csrfToken,
    user: { id: userId, email, firstName, lastName, role, organizationId },
  };
}

export async function login(
  email: string,
  password: string,
  meta: RequestMeta,
): Promise<SessionTokens> {
  const user = await prisma.user.findUnique({ where: { email } });

  // Same error for "no such user" and "wrong password" on purpose —
  // distinguishing them lets an attacker enumerate which emails have accounts.
  if (!user || user.deletedAt) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    throw AppError.unauthorized('Invalid email or password');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return issueSession(
    user.id,
    user.organizationId,
    user.role,
    user.email,
    user.firstName,
    user.lastName,
    meta,
  );
}

export async function refresh(presentedToken: string, meta: RequestMeta): Promise<SessionTokens> {
  const tokenHash = hashToken(presentedToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored) {
    throw AppError.unauthorized('Invalid refresh token');
  }

  if (stored.revokedAt) {
    // Someone presented a token we already rotated away from. That's not a normal
    // expiry — it means a stolen token from an earlier session is being replayed.
    // Kill every live refresh token this user has, not just this one.
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw AppError.unauthorized('Session invalid — please log in again');
  }

  if (stored.expiresAt < new Date()) {
    throw AppError.unauthorized('Refresh token expired');
  }

  if (stored.user.deletedAt) {
    throw AppError.unauthorized('Account no longer active');
  }

  const next = await issueSession(
    stored.user.id,
    stored.user.organizationId,
    stored.user.role,
    stored.user.email,
    stored.user.firstName,
    stored.user.lastName,
    meta,
  );

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date(), replacedByTokenHash: hashToken(next.refreshToken) },
  });

  return next;
}

export async function logout(presentedToken: string | undefined): Promise<void> {
  if (!presentedToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(presentedToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function extractRequestMeta(req: Request): RequestMeta {
  const meta: RequestMeta = {};
  const ua = req.headers['user-agent'];
  if (typeof ua === 'string') meta.userAgent = ua;
  if (req.ip) meta.ipAddress = req.ip;
  return meta;
}
