import { Router } from 'express';
import { asyncHandler } from '@/utils/asyncHandler';
import { getHealth } from '@/modules/health/health.controller';

export const healthRouter = Router();

healthRouter.get('/', asyncHandler(getHealth));
