import { PrismaClient } from '@prisma/client';
import { env } from '@/config/env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

// Prevent hot-reload (tsx watch) from spawning a new client + connection pool on every save
if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
