import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '@/app';
import { prisma } from '@/lib/prisma';

interface HealthResponseBody {
  status: 'ok' | 'degraded';
  timestamp: string;
  db: 'up' | 'down';
}

describe('GET /health', () => {
  it('returns 200 and status ok when the database is reachable', async () => {
    vi.spyOn(prisma, '$queryRaw').mockResolvedValueOnce([{ '?column?': 1 }]);

    const app = createApp();
    const res = await request(app).get('/health');
    const body = res.body as HealthResponseBody;

    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.db).toBe('up');
  });

  it('returns 503 when the database is unreachable', async () => {
    vi.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('connection refused'));

    const app = createApp();
    const res = await request(app).get('/health');
    const body = res.body as HealthResponseBody;

    expect(res.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.db).toBe('down');
  });
});