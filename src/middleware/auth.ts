import { NextFunction, Request, Response } from 'express';
import { StaffRole } from '@prisma/client';
import { ACCESS_TOKEN_COOKIE } from '@/config/cookies';
import { verifyAccessToken } from '@/utils/tokens';
import { AppError } from '@/utils/AppError';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;
  if (!token) {
    next(AppError.unauthorized('Not authenticated'));
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, organizationId: payload.organizationId, role: payload.role };
    next();
  } catch {
    next(AppError.unauthorized('Session expired or invalid'));
  }
}

export function requireRole(...roles: StaffRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(AppError.unauthorized('Not authenticated'));
    if (!roles.includes(req.user.role)) return next(AppError.forbidden('Insufficient permissions'));
    next();
  };
}