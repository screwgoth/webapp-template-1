import { PrismaClient } from '@prisma/client';

// Create a singleton instance for tests
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/testdb',
    },
  },
});

// Clean database before each test
beforeEach(async () => {
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
});

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
