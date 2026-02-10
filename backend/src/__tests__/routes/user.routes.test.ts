import request from 'supertest';
import express, { Express } from 'express';
import userRoutes from '../../routes/user.routes';
import { errorHandler } from '../../middleware/errorHandler';
import { PrismaClient } from '@prisma/client';
import { createAuthenticatedUser } from '../helpers';

const prisma = new PrismaClient();

describe('User Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
    app.use(errorHandler);
  });

  describe('GET /api/users/me', () => {
    it('should get current user profile', async () => {
      const user = await createAuthenticatedUser({
        name: 'Test User',
        email: 'getme@example.com',
      });

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
      });
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should reject request without authentication', async () => {
      await request(app).get('/api/users/me').expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });

  describe('PUT /api/users/me', () => {
    it('should update user name', async () => {
      const user = await createAuthenticatedUser();

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.name).toBe('Updated Name');

      // Verify in database
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(updatedUser?.name).toBe('Updated Name');
    });

    it('should update user email', async () => {
      const user = await createAuthenticatedUser();

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ email: 'newemail@example.com' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('newemail@example.com');
    });

    it('should update user avatar', async () => {
      const user = await createAuthenticatedUser();

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ avatar: 'https://example.com/avatar.jpg' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('should update multiple fields at once', async () => {
      const user = await createAuthenticatedUser();

      const updateData = {
        name: 'New Name',
        email: 'new@example.com',
        avatar: 'https://example.com/new-avatar.jpg',
      };

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.user).toMatchObject(updateData);
    });

    it('should reject email that is already in use', async () => {
      const user1 = await createAuthenticatedUser({
        email: 'user1@example.com',
      });
      const user2 = await createAuthenticatedUser({
        email: 'user2@example.com',
      });

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send({ email: user2.email })
        .expect(400);

      expect(response.body.message).toContain('already in use');
    });

    it('should allow updating email to the same email', async () => {
      const user = await createAuthenticatedUser({
        email: 'same@example.com',
      });

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ email: user.email })
        .expect(200);

      expect(response.body.status).toBe('success');
    });

    it('should require authentication', async () => {
      await request(app)
        .put('/api/users/me')
        .send({ name: 'New Name' })
        .expect(401);
    });

    it('should create audit log on update', async () => {
      const user = await createAuthenticatedUser();

      await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ name: 'Updated Name' });

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          userId: user.id,
          action: 'USER_UPDATED',
        },
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog?.details).toBeDefined();
    });

    it('should validate email format', async () => {
      const user = await createAuthenticatedUser();

      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /api/users/me', () => {
    it('should delete user account', async () => {
      const user = await createAuthenticatedUser();

      const response = await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('deleted successfully');

      // Verify user deleted from database
      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser).toBeNull();
    });

    it('should delete all user sessions on account deletion', async () => {
      const user = await createAuthenticatedUser();

      // Verify session exists before deletion
      const sessionsBefore = await prisma.session.findMany({
        where: { userId: user.id },
      });
      expect(sessionsBefore.length).toBeGreaterThan(0);

      await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      // Verify sessions deleted (cascade)
      const sessionsAfter = await prisma.session.findMany({
        where: { userId: user.id },
      });
      expect(sessionsAfter).toHaveLength(0);
    });

    it('should require authentication', async () => {
      await request(app).delete('/api/users/me').expect(401);
    });

    it('should create audit log on deletion', async () => {
      const user = await createAuthenticatedUser();

      await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          action: 'USER_DELETED',
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog?.userId).toBeNull(); // User is deleted
    });

    it('should not allow multiple deletions', async () => {
      const user = await createAuthenticatedUser();

      // First deletion should succeed
      await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(200);

      // Second deletion should fail (user no longer exists)
      await request(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${user.accessToken}`)
        .expect(404);
    });
  });
});
