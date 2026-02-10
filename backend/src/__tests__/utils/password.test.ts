import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} from '../../utils/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should hash empty string', async () => {
      const hash = await hashPassword('');
      expect(hash).toBeDefined();
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await hashPassword(password);
      const result = await comparePassword(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it('should return false for empty password against hash', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const result = await comparePassword('', hash);

      expect(result).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const result = await comparePassword('testpassword123!', hash);

      expect(result).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept strong password', () => {
      const result = validatePasswordStrength('StrongPass123!');

      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePasswordStrength('Short1!');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('8 characters');
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePasswordStrength('lowercase123!');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePasswordStrength('UPPERCASE123!');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('lowercase');
    });

    it('should reject password without number', () => {
      const result = validatePasswordStrength('NoNumberPass!');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('number');
    });

    it('should reject password without special character', () => {
      const result = validatePasswordStrength('NoSpecial123');

      expect(result.valid).toBe(false);
      expect(result.message).toContain('special character');
    });

    it('should accept password with all requirements', () => {
      const passwords = [
        'ValidPass123!',
        'Another@Valid1',
        'Str0ng#Password',
        'Test$Pass123',
      ];

      passwords.forEach((password) => {
        const result = validatePasswordStrength(password);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject empty password', () => {
      const result = validatePasswordStrength('');

      expect(result.valid).toBe(false);
    });

    it('should accept password with exactly 8 characters', () => {
      const result = validatePasswordStrength('Valid12!');

      expect(result.valid).toBe(true);
    });

    it('should accept very long passwords', () => {
      const longPassword = 'VeryLongPassword123!'.repeat(5);
      const result = validatePasswordStrength(longPassword);

      expect(result.valid).toBe(true);
    });
  });
});
