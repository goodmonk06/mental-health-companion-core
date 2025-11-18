import { describe, it, expect } from 'vitest';
import { AppError, ValidationError, NotFoundError, InternalError } from '../../lib/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with status code and message', () => {
      const error = new AppError(400, 'Bad request');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
      expect(error.isOperational).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Invalid input');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.isOperational).toBe(true);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with 404 status', () => {
      const error = new NotFoundError('User not found');

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });

    it('should have default message', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Resource not found');
    });
  });

  describe('InternalError', () => {
    it('should create internal error with 500 status', () => {
      const error = new InternalError('Database connection failed');

      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Database connection failed');
      expect(error.isOperational).toBe(false);
    });

    it('should have default message', () => {
      const error = new InternalError();

      expect(error.message).toBe('Internal server error');
    });
  });
});
