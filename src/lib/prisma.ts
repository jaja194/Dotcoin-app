import { PrismaClient } from '@prisma/client';

// Declare a global variable to prevent multiple Prisma client instances in Next.js hot-reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Export the singleton Prisma instance
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;