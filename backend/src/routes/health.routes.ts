import { Router } from 'express';
import prisma from '../config/database';

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'success',
      data: {
        service: 'webapp-template-api',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: 'connected',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      data: {
        service: 'webapp-template-api',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      },
    });
  }
});

export default router;
