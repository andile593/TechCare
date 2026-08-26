import { PrismaClient } from '@prisma/client';
import { env } from '@/config/env';
import { requestContext } from '@/lib/requestContext';

/* eslint-disable no-var */
declare global {
  var __prisma: ReturnType<typeof createExtendedClient> | undefined;
}
/* eslint-enable no-var */

function getRequiredOrgId(): string {
  const ctx = requestContext.getStore();
  if (!ctx) {
    throw new Error(
      'No request context found. A Patient query ran outside an authenticated request ' +
        '(e.g. a script). Use a plain, unextended PrismaClient for scripts/seeds instead.',
    );
  }
  return ctx.organizationId;
}

// Fixed type signature to satisfy explicit-function-return-type
function createExtendedClient() {
  const rawPrisma = new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

  return rawPrisma.$extends({
    query: {
      patient: {
        async findMany({ args, query }) {
          args.where = { ...args.where, organizationId: getRequiredOrgId() };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, organizationId: getRequiredOrgId() };
          return query(args);
        },
        async findUnique({ args, query }) {
          // Bypasses unsafe 'any' using an indexable unknown record type
          const customArgs = args as Record<string, unknown>;
          customArgs.where = {
            ...(customArgs.where as Record<string, unknown> | undefined),
            organizationId: getRequiredOrgId(),
          };
          return query(args);
        },
        async count({ args, query }) {
          args.where = { ...args.where, organizationId: getRequiredOrgId() };
          return query(args);
        },
        async create({ args, query }) {
          const customArgs = args as Record<string, unknown>;
          customArgs.data = {
            ...(customArgs.data as Record<string, unknown> | undefined),
            organizationId: getRequiredOrgId(),
          };
          return query(args);
        },
        async update({ args, query }) {
          const customArgs = args as Record<string, unknown>;
          customArgs.where = {
            ...(customArgs.where as Record<string, unknown> | undefined),
            organizationId: getRequiredOrgId(),
          };
          return query(args);
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, organizationId: getRequiredOrgId() };
          return query(args);
        },
        async delete({ args, query }) {
          const customArgs = args as Record<string, unknown>;
          customArgs.where = {
            ...(customArgs.where as Record<string, unknown> | undefined),
            organizationId: getRequiredOrgId(),
          };
          return query(args);
        },
        async deleteMany({ args, query }) {
          args.where = { ...args.where, organizationId: getRequiredOrgId() };
          return query(args);
        },
      },
    },
  });
}

export const prisma = global.__prisma ?? createExtendedClient();

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
