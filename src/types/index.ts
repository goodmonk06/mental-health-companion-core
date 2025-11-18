export type LLMProvider = 'openai' | 'anthropic';

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export interface SessionStartParams {
  userId: string;
  moodTag?: string;
}

export interface SessionEndParams {
  sessionId: string;
  generateJournal?: boolean;
}

export interface ChatParams {
  sessionId: string;
  userMessage: string;
}

export interface SafetyCheckResult {
  isSafe: boolean;
  flags: Array<{
    type: string;
    keyword?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export interface JournalGenerationResult {
  title: string;
  content: string;
  tags: string[];
  summary: string;
}
