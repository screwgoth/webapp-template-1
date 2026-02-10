import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const prisma = new PrismaClient();

export interface TestUser {
  id: string;
  email: string;
  name: string;
  password: string;
  avatar?: string;
}

export interface TestUserWithTokens extends TestUser {
  accessToken: string;
  refreshToken: string;
}

/**
 * Create a test user in the database
 */
export const createTestUser = async (
  overrides: Partial<TestUser> = {}
): Promise<TestUser> => {
  const userData = {
    email: overrides.email || `test-${Date.now()}@example.com`,
    name: overrides.name || 'Test User',
    password: overrides.password || 'Password123!',
    avatar: overrides.avatar,
  };

  const hashedPassword = await hashPassword(userData.password);

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      avatar: userData.avatar,
    },
  });

  return {
    ...user,
    password: userData.password, // Return plain password for testing
  };
};

/**
 * Create a test user with authentication tokens
 */
export const createAuthenticatedUser = async (
  overrides: Partial<TestUser> = {}
): Promise<TestUserWithTokens> => {
  const user = await createTestUser(overrides);

  const accessToken = generateAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

  // Store refresh token in session
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    ...user,
    accessToken,
    refreshToken,
  };
};

/**
 * Clean up all test data
 */
export const cleanupTestData = async () => {
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
};

/**
 * Generate a valid JWT token for testing
 */
export const generateTestToken = (userId: string, email: string): string => {
  return generateAccessToken({ userId, email });
};

/**
 * Generate an invalid/expired token for testing
 */
export const generateInvalidToken = (): string => {
  return 'invalid.token.here';
};
