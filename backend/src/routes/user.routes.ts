import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/database';
import { updateUserSchema } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user
router.get('/me', async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// Update current user
router.put('/me', async (req: AuthRequest, res, next) => {
  try {
    const body = updateUserSchema.parse(req.body);

    // Check if email is being changed and if it's already taken
    if (body.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: body.email,
          NOT: {
            id: req.user!.userId,
          },
        },
      });

      if (existingUser) {
        throw new AppError(400, 'Email is already in use');
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: body,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'USER_UPDATED',
        resource: 'user',
        details: body,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    res.json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// Delete current user
router.delete('/me', async (req: AuthRequest, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.user!.userId },
    });

    // Log audit (orphaned, but kept for records)
    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'USER_DELETED',
        resource: 'user',
        details: { deletedUserId: req.user!.userId },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    res.json({
      status: 'success',
      message: 'User account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
