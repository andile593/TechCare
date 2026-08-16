import { PrismaClient, StaffRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const org = await prisma.organization.upsert({
    where: { id: 'seed-org-id' },
    update: {},
    create: { id: 'seed-org-id', name: 'TechCare Demo Clinic' },
  });

  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@techcare.dev' },
    update: {},
    create: {
      organizationId: org.id,
      email: 'admin@techcare.dev',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: StaffRole.ADMIN,
    },
  });

  console.log('Seeded org:', org.name);
  console.log('Seeded admin:', admin.email, '(password: ChangeMe123!)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });