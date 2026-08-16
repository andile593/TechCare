import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { verifyCsrf } from '@/middleware/csrf';
import { requireAuth } from '@/middleware/auth';
import { postLogin, postRefresh, postLogout } from '@/modules/auth/auth.controller';

export const authRouter = Router();

// Login is pre-session — no CSRF cookie exists yet, nothing to check against.
authRouter.post('/login', asyncHandler(postLogin));

// Refresh and logout act on an existing cookie session — CSRF applies to both.
authRouter.post('/refresh', verifyCsrf, asyncHandler(postRefresh));
authRouter.post('/logout', requireAuth, verifyCsrf, asyncHandler(postLogout));
