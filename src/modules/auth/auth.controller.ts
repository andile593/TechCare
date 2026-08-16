import { Request, Response } from 'express';
import { loginSchema } from '@/modules/auth/auth.schema';
import * as authService from '@/modules/auth/auth.service';
import {
  ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, CSRF_TOKEN_COOKIE,
  accessTokenCookieOptions, refreshTokenCookieOptions, csrfTokenCookieOptions,
} from '@/config/cookies';
import { AppError } from '@/utils/AppError';

function setSessionCookies(res: Response, tokens: { accessToken: string; refreshToken: string; csrfToken: string }): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, accessTokenCookieOptions);
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, refreshTokenCookieOptions);
  res.cookie(CSRF_TOKEN_COOKIE, tokens.csrfToken, csrfTokenCookieOptions);
}

function clearSessionCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, accessTokenCookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions);
  res.clearCookie(CSRF_TOKEN_COOKIE, csrfTokenCookieOptions);
}

export async function postLogin(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);
  const session = await authService.login(email, password, authService.extractRequestMeta(req));
  setSessionCookies(res, session);
  res.status(200).json({ user: session.user });
}

export async function postRefresh(req: Request, res: Response): Promise<void> {
  const presented = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
  if (!presented) throw AppError.unauthorized('No refresh token provided');

  const session = await authService.refresh(presented, authService.extractRequestMeta(req));
  setSessionCookies(res, session);
  res.status(200).json({ user: session.user });
}

export async function postLogout(req: Request, res: Response): Promise<void> {
  const presented = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
  await authService.logout(presented);
  clearSessionCookies(res);
  res.status(204).send();
}