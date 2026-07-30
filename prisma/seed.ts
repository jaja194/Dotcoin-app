import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('AdminSecurePass123!', 10);

  // Safely create or keep the initial Admin user
  await prisma.user.upsert({
    where: { email: 'admin@dotcoin.app' },
    update: {},
    create: {
      email: 'admin@dotcoin.app',
      password: adminPasswordHash,
      role: 'ADMIN' as Role,
    },
  });

  console.log('Seed completed: Admin account is ready.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });