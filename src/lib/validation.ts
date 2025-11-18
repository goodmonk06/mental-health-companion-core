import { z } from 'zod';

// Session schemas
export const startSessionSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  moodTag: z.string().optional(),
});

export const endSessionSchema = z.object({
  generateJournal: z.boolean().optional().default(true),
});

// Chat schema
export const chatSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  message: z.string().min(1, 'message is required').max(5000, 'message too long'),
});

// Export types
export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
