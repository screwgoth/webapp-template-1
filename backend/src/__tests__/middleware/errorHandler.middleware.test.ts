import { Request, Response } from 'express';
import { errorHandler, AppError } from '../../middleware/errorHandler';
import { ZodError } from 'zod';

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('AppError handling', () => {
    it('should handle AppError with custom status code and message', () => {
      const error = new AppError(404, 'Resource not found');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Resource not found',
      });
    });

    it('should handle AppError with 500 status code', () => {
      const error = new AppError(500, 'Internal server error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });

    it('should handle AppError with 400 status code', () => {
      const error = new AppError(400, 'Bad request');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('ZodError handling', () => {
    it('should format Zod validation errors', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['email'],
          message: 'Expected string, received number',
        },
      ]);

      errorHandler(zodError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Validation error',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: 'Expected string, received number',
          }),
        ]),
      });
    });

    it('should handle multiple Zod validation errors', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['name'],
          message: 'Required',
        },
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['email'],
          message: 'Expected string, received number',
        },
      ]);

      errorHandler(zodError, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      const jsonCall = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.errors).toHaveLength(2);
    });
  });

  describe('Generic error handling', () => {
    it('should handle generic Error objects', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went wrong',
      });
    });

    it('should handle unknown error types', () => {
      const error = 'String error';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'An unexpected error occurred',
      });
    });

    it('should handle null error', () => {
      errorHandler(null, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('AppError class', () => {
    it('should create AppError with status code and message', () => {
      const error = new AppError(403, 'Forbidden');

      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
    });

    it('should be throwable', () => {
      expect(() => {
        throw new AppError(400, 'Bad Request');
      }).toThrow(AppError);
    });
  });
});
