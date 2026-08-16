import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '@/utils/AppError';
import { logger } from '@/utils/logger';
import { env } from '@/config/env';

interface ErrorResponseBody {
  error: {
    message: string;
    details?: unknown;
    stack?: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    details = err.flatten();
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = `A record with this ${(err.meta?.target as string[])?.join(', ') ?? 'value'} already exists`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else {
      statusCode = 400;
      message = 'Database request error';
    }
  } else if (err instanceof Error) {
    message = env.NODE_ENV === 'production' ? message : err.message;
  }

  if (statusCode >= 500) {
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');
  } else {
    logger.warn({ path: req.path, method: req.method, statusCode, message }, 'Request error');
  }

  const body: ErrorResponseBody = { error: { message, details } };
  if (env.NODE_ENV === 'development' && err instanceof Error && err.stack) {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
