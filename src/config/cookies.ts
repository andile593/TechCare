import { CookieOptions } from 'express';
import { env } from '@/config/env';

const isProd = env.NODE_ENV === 'production';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const CSRF_TOKEN_COOKIE = 'csrf_token';

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd, // HTTPS only in production; allow http on localhost dev
  sameSite: 'lax',
  path: '/',
  maxAge: 15 * 60 * 1000, // 15 minutes — matches JWT_EXPIRES_IN, keep these in sync manually
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/api/v1/auth', // scoped — this cookie has no reason to be sent to /api/v1/patients etc.
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const csrfTokenCookieOptions: CookieOptions = {
  httpOnly: false, // must be JS-readable — that's the whole point of double-submit
  secure: isProd,
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
