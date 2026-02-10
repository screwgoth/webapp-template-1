import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from '../../routes/auth.routes';
import { errorHandler } from '../../middleware/errorHandler';
import { PrismaClient } from '@prisma/client';
import { createTestUser, createAuthenticatedUser } from '../helpers';
import { verifyAccessToken, verifyRefreshToken } from '../../utils/jwt';

const prisma = new PrismaClient();

describe('Auth Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toMatchObject({
        name: userData.name,
        email: userData.email,
      });
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      // Verify user in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();
      expect(user?.name).toBe(userData.name);
    });

    it('should reject registration with existing email', async () => {
      const user = await createTestUser({ email: 'existing@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: user.email,
          password: 'Password123!',
        })
        .expect(400);

      expect(response.body.message).toContain('already exists');
    });

    it('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'weak@example.com',
          password: 'weak',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          // missing name and password
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password123!',
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const user = await createTestUser({
        email: 'login@example.com',
        password: 'Password123!',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      // Verify tokens are valid
      const accessPayload = verifyAccessToken(response.body.data.accessToken);
      expect(accessPayload.userId).toBe(user.id);

      // Verify session created
      const session = await prisma.session.findUnique({
        where: { refreshToken: response.body.data.refreshToken },
      });
      expect(session).toBeTruthy();
      expect(session?.userId).toBe(user.id);
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should reject login with invalid password', async () => {
      const user = await createTestUser({
        email: 'wrongpass@example.com',
        password: 'CorrectPass123!',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'WrongPass123!',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should create audit log on successful login', async () => {
      const user = await createTestUser({
        email: 'audit@example.com',
        password: 'Password123!',
      });

      await request(app).post('/api/auth/login').send({
        email: user.email,
        password: 'Password123!',
      });

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user.id,
          action: 'USER_LOGIN',
        },
      });

      expect(auditLog).toBeTruthy();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const user = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ refreshToken: user.refreshToken })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('Logged out successfully');

      // Verify session removed
      const session = await prisma.session.findUnique({
        where: { refreshToken: user.refreshToken },
      });
      expect(session).toBeNull();
    });

    it('should reject logout without token', async () => {
      await request(app).post('/api/auth/logout').expect(401);
    });

    it('should create audit log on logout', async () => {
      const user = await createAuthenticatedUser();

      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ refreshToken: user.refreshToken });

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user.id,
          action: 'USER_LOGOUT',
        },
      });

      expect(auditLog).toBeTruthy();
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const user = await createAuthenticatedUser();

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: user.refreshToken })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.refreshToken).not.toBe(user.refreshToken);

      // Verify new tokens are valid
      const accessPayload = verifyAccessToken(response.body.data.accessToken);
      expect(accessPayload.userId).toBe(user.id);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' })
        .expect(401);

      expect(response.body.message).toBeDefined();
    });

    it('should reject expired refresh token', async () => {
      const user = await createAuthenticatedUser();

      // Manually expire the session
      await prisma.session.update({
        where: { refreshToken: user.refreshToken },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: user.refreshToken })
        .expect(401);

      expect(response.body.message).toContain('expired');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return success for existing email', async () => {
      const user = await createTestUser({ email: 'forgot@example.com' });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: user.email })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('reset link');
    });

    it('should return success for non-existing email (prevent enumeration)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('reset link');
    });

    it('should create audit log for existing user', async () => {
      const user = await createTestUser({ email: 'audit-forgot@example.com' });

      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: user.email });

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user.id,
          action: 'PASSWORD_RESET_REQUESTED',
        },
      });

      expect(auditLog).toBeTruthy();
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should accept valid password reset', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'some-token',
          password: 'NewPassword123!',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'some-token',
          password: 'weak',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const user = await createAuthenticatedUser({
        password: 'OldPassword123!',
      });

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('changed successfully');

      // Verify all sessions invalidated
      const sessions = await prisma.session.findMany({
        where: { userId: user.id },
      });
      expect(sessions).toHaveLength(0);
    });

    it('should reject incorrect current password', async () => {
      const user = await createAuthenticatedUser({
        password: 'OldPassword123!',
      });

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!',
        })
        .expect(401);

      expect(response.body.message).toContain('Current password is incorrect');
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'Old123!',
          newPassword: 'New123!',
        })
        .expect(401);
    });

    it('should create audit log on password change', async () => {
      const user = await createAuthenticatedUser({
        password: 'OldPassword123!',
      });

      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!',
        });

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user.id,
          action: 'PASSWORD_CHANGED',
        },
      });

      expect(auditLog).toBeTruthy();
    });
  });
});
