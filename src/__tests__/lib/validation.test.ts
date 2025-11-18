import { describe, it, expect } from 'vitest';
import { startSessionSchema, chatSchema, endSessionSchema } from '../../lib/validation';

describe('Validation Schemas', () => {
  describe('startSessionSchema', () => {
    it('should validate valid session start data', () => {
      const data = { userId: 'user123', moodTag: '穏やか' };
      const result = startSessionSchema.parse(data);

      expect(result.userId).toBe('user123');
      expect(result.moodTag).toBe('穏やか');
    });

    it('should require userId', () => {
      const data = { moodTag: '穏やか' };

      expect(() => startSessionSchema.parse(data)).toThrow();
    });

    it('should allow missing moodTag', () => {
      const data = { userId: 'user123' };
      const result = startSessionSchema.parse(data);

      expect(result.userId).toBe('user123');
      expect(result.moodTag).toBeUndefined();
    });
  });

  describe('chatSchema', () => {
    it('should validate valid chat data', () => {
      const data = { sessionId: 'session123', message: 'Hello' };
      const result = chatSchema.parse(data);

      expect(result.sessionId).toBe('session123');
      expect(result.message).toBe('Hello');
    });

    it('should require sessionId and message', () => {
      expect(() => chatSchema.parse({ sessionId: 'session123' })).toThrow();
      expect(() => chatSchema.parse({ message: 'Hello' })).toThrow();
    });

    it('should reject empty message', () => {
      const data = { sessionId: 'session123', message: '' };

      expect(() => chatSchema.parse(data)).toThrow();
    });

    it('should reject message that is too long', () => {
      const data = {
        sessionId: 'session123',
        message: 'a'.repeat(5001)
      };

      expect(() => chatSchema.parse(data)).toThrow();
    });
  });

  describe('endSessionSchema', () => {
    it('should have default value for generateJournal', () => {
      const data = {};
      const result = endSessionSchema.parse(data);

      expect(result.generateJournal).toBe(true);
    });

    it('should allow explicit generateJournal value', () => {
      const data = { generateJournal: false };
      const result = endSessionSchema.parse(data);

      expect(result.generateJournal).toBe(false);
    });
  });
});
