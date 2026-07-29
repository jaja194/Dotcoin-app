import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';


const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Hash default password for seed users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminSecurePass123!', salt);
  const userPasswordHash = await bcrypt.hash('InvestorPass123!', salt);

  // 2. Create Default System Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dotcoin.app' },
    update: {},
    create: {
      email: 'admin@dotcoin.app',
      name: 'System Admin',
      password: adminPasswordHash,
      role: 'ADMIN' as Role,
      walletBalance: 0.0,
      totalInvested: 0.0,
      totalProfits: 0.0,
    },
  });

  console.log(`✅ Admin user seeded: ${adminUser.email}`);

  // 3. Create Demo Investor User
  const demoInvestor = await prisma.user.upsert({
    where: { email: 'investor@dotcoin.app' },
    update: {},
    create: {
      email: 'investor@dotcoin.app',
      name: 'Alpha Investor',
      password: userPasswordHash,
      role: 'USER',
      walletBalance: 12450.0,
      totalInvested: 25000.0,
      totalProfits: 8420.5,
    },
  });

  console.log(`✅ Demo investor seeded: ${demoInvestor.email}`);

  // 4. Seed Bot Packages / Trading Tiers
  // Adjust model names (e.g. botPackage, botTier, plan) to match your schema exact case if needed
  const botPackages = [
    {
      code: 'QUANTUM_ALPHA',
      name: 'Quantum Alpha',
      description: 'AI-driven high-frequency arbitrage algorithm focused on major crypto trading pairs.',
      accessFee: 500.0,
      targetRoi: 100.0,
      minDeposit: 1000.0,
      maxDeposit: 50000.0,
      lockupDays: 365,
      isFeatured: true,
    },
    {
      code: 'APEX_TRADER',
      name: 'Apex Trader',
      description: 'Institutional trend-following bot designed for maximum capital preservation and steady yield.',
      accessFee: 250.0,
      targetRoi: 67.0,
      minDeposit: 500.0,
      maxDeposit: 25000.0,
      lockupDays: 365,
      isFeatured: false,
    },
    {
      code: 'TITAN_NEXUS',
      name: 'Titan Nexus',
      description: 'Conservative multi-exchange yield farming engine optimized for minimal risk exposure.',
      accessFee: 100.0,
      targetRoi: 40.0,
      minDeposit: 250.0,
      maxDeposit: 10000.0,
      lockupDays: 365,
      isFeatured: false,
    },
  ];

  for (const bot of botPackages) {
    // Check if package model exists or upsert based on unique code/name
    if ('botPackage' in prisma) {
      await (prisma as any).botPackage.upsert({
        where: { code: bot.code },
        update: bot,
        create: bot,
      });
    } else if ('botTier' in prisma) {
      await (prisma as any).botTier.upsert({
        where: { code: bot.code },
        update: bot,
        create: bot,
      });
    }
    console.log(`🤖 Bot Package seeded: ${bot.name}`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });