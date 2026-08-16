import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { logger } from '@/utils/logger';
import { healthRouter } from '@/modules/health/health.routes';
import { authRouter } from '@/modules/auth/auth.routes';
import { notFoundHandler } from '@/middleware/notFound';
import { errorHandler } from '@/middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  app.use('/health', healthRouter);
  app.use('/api/v1/auth', authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
