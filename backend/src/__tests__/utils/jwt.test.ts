import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../utils/jwt';

describe('JWT Utilities', () => {
  const testPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateAccessToken(testPayload);
      const token2 = generateAccessToken({
        userId: 'different-user-id',
        email: 'different@example.com',
      });

      expect(token1).not.toBe(token2);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate different tokens for different payloads', () => {
      const token1 = generateRefreshToken(testPayload);
      const token2 = generateRefreshToken({
        userId: 'different-user-id',
        email: 'different@example.com',
      });

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid access token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid.token.here');
      }).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => {
        verifyAccessToken('');
      }).toThrow();
    });

    it('should throw error for malformed token', () => {
      expect(() => {
        verifyAccessToken('malformed');
      }).toThrow();
    });

    it('should not accept refresh token as access token', () => {
      const refreshToken = generateRefreshToken(testPayload);

      // This should throw because refresh tokens are signed differently
      expect(() => {
        verifyAccessToken(refreshToken);
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and decode a valid refresh token', () => {
      const token = generateRefreshToken(testPayload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyRefreshToken('invalid.token.here');
      }).toThrow();
    });

    it('should throw error for empty token', () => {
      expect(() => {
        verifyRefreshToken('');
      }).toThrow();
    });

    it('should not accept access token as refresh token', () => {
      const accessToken = generateAccessToken(testPayload);

      // This should throw because access tokens are signed differently
      expect(() => {
        verifyRefreshToken(accessToken);
      }).toThrow();
    });
  });

  describe('Token expiration', () => {
    it('should include expiration in token payload', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.exp).toBe('number');
    });

    it('should have different expiration times for access and refresh tokens', () => {
      const accessToken = generateAccessToken(testPayload);
      const refreshToken = generateRefreshToken(testPayload);

      const accessDecoded = verifyAccessToken(accessToken);
      const refreshDecoded = verifyRefreshToken(refreshToken);

      // Refresh token should expire later than access token
      expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
    });
  });

  describe('Token payload', () => {
    it('should preserve userId in token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(testPayload.userId);
    });

    it('should preserve email in token', () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.email).toBe(testPayload.email);
    });

    it('should handle special characters in email', () => {
      const payload = {
        userId: 'test-id',
        email: 'test+special@example.com',
      };

      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.email).toBe(payload.email);
    });
  });
});
