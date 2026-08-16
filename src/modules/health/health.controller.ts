import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  let dbStatus: 'up' | 'down' = 'down';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'up';
  } catch {
    dbStatus = 'down';
  }

  const healthy = dbStatus === 'up';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    db: dbStatus,
  });
}
