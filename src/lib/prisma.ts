import { PrismaClient, Prisma } from '@prisma/client';
import { env } from '@/config/env';
import { requestContext } from '@/lib/requestContext';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: ReturnType<typeof createExtendedClient> | undefined;
}

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

function createExtendedClient(): PrismaClient {
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
          const uniqueArgs = args as Prisma.PatientFindUniqueArgs;
          uniqueArgs.where = { ...uniqueArgs.where, organizationId: getRequiredOrgId() };
          return query(uniqueArgs);
        },
        async count({ args, query }) {
          args.where = { ...args.where, organizationId: getRequiredOrgId() };
          return query(args);
        },
        async create({ args, query }) {
          const createArgs = args as Prisma.PatientCreateArgs;
          createArgs.data = { ...createArgs.data, organizationId: getRequiredOrgId() };
          return query(createArgs);
        },
        async update({ args, query }) {
          const updateArgs = args as Prisma.PatientUpdateArgs;
          updateArgs.where = { ...updateArgs.where, organizationId: getRequiredOrgId() };
          return query(updateArgs);
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, organizationId: getRequiredOrgId() };
          return query(args);
        },
        async delete({ args, query }) {
          const deleteArgs = args as Prisma.PatientDeleteArgs;
          deleteArgs.where = { ...deleteArgs.where, organizationId: getRequiredOrgId() };
          return query(deleteArgs);
        },
      },
    },
  }) as unknown as PrismaClient;
}

export const prisma = globalThis.__prisma ?? createExtendedClient();

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
