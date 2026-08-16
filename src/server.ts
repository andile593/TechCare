import { createApp } from '@/app';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { prisma } from '@/lib/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`TechCare API listening on port ${env.PORT} [${env.NODE_ENV}]`);
});

function shutdown(signal: string): void {
  logger.info(`${signal} received: shutting down gracefully`);

  server.close(() => {
    void (async () => {
      await prisma.$disconnect();
      logger.info('Shutdown complete');
      process.exit(0);
    })();
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});