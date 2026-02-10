import { Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { generateAccessToken } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should authenticate valid token', () => {
      const token = generateAccessToken({
        userId: 'test-user-id',
        email: 'test@example.com',
      });

      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.userId).toBe('test-user-id');
      expect(mockReq.user?.email).toBe('test@example.com');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject request without authorization header', () => {
      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0] as AppError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('No token provided');
    });

    it('should reject request with invalid token format', () => {
      mockReq.headers = {
        authorization: 'InvalidFormat token',
      };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0] as AppError;
      expect(error.statusCode).toBe(401);
    });

    it('should reject request with Bearer but no token', () => {
      mockReq.headers = {
        authorization: 'Bearer ',
      };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0] as AppError;
      expect(error.statusCode).toBe(401);
    });

    it('should reject expired token', () => {
      const invalidToken = 'invalid.token.here';

      mockReq.headers = {
        authorization: `Bearer ${invalidToken}`,
      };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = (mockNext as jest.Mock).mock.calls[0][0] as AppError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('Invalid or expired token');
    });

    it('should reject malformed token', () => {
      mockReq.headers = {
        authorization: 'Bearer malformed',
      };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });

    it('should be case-sensitive for Bearer prefix', () => {
      const token = generateAccessToken({
        userId: 'test-user-id',
        email: 'test@example.com',
      });

      mockReq.headers = {
        authorization: `bearer ${token}`, // lowercase
      };

      authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
