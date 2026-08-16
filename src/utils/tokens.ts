import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { StaffRole } from '@prisma/client';
import { env } from '@/config/env';

export interface AccessTokenPayload {
  sub: string;
  organizationId: string;
  role: StaffRole;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}