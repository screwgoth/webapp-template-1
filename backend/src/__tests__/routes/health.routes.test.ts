import request from 'supertest';
import express, { Express } from 'express';
import healthRoutes from '../../routes/health.routes';

describe('Health Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use('/api/health', healthRoutes);
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health').expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(typeof response.body.data.uptime).toBe('number');
      expect(response.body.data.uptime).toBeGreaterThan(0);
    });

    it('should return timestamp as ISO string', async () => {
      const response = await request(app).get('/api/health').expect(200);

      const timestamp = response.body.data.timestamp;
      expect(timestamp).toBeDefined();
      expect(() => new Date(timestamp)).not.toThrow();
    });

    it('should be accessible without authentication', async () => {
      // This endpoint should be public
      const response = await request(app).get('/api/health').expect(200);

      expect(response.body.status).toBe('success');
    });
  });
});
