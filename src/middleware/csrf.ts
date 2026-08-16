import { NextFunction, Request, Response } from 'express';
import { CSRF_TOKEN_COOKIE } from '@/config/cookies';
import { AppError } from '@/utils/AppError';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function verifyCsrf(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) return next();

  const cookieToken = req.cookies?.[CSRF_TOKEN_COOKIE] as string | undefined;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(AppError.forbidden('CSRF token missing or invalid'));
  }
  next();
}