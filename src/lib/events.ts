import { EventEmitter } from 'events';

// Domain event types
export interface DomainEvent {
  type: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface SessionStartedEvent extends DomainEvent {
  type: 'session.started';
  sessionId: string;
  userId: string;
  moodTag?: string;
}

export interface SessionEndedEvent extends DomainEvent {
  type: 'session.ended';
  sessionId: string;
  userId: string;
  durationMs: number;
}

export interface MessageSentEvent extends DomainEvent {
  type: 'message.sent';
  sessionId: string;
  userId: string;
  role: 'user' | 'ai';
  messageId: string;
}

export interface SafetyFlagRaisedEvent extends DomainEvent {
  type: 'safety.flag_raised';
  sessionId: string;
  userId: string;
  severity: string;
  keyword?: string;
}

export interface JournalCreatedEvent extends DomainEvent {
  type: 'journal.created';
  journalId: string;
  userId: string;
  sessionId?: string;
}

export interface GoalCreatedEvent extends DomainEvent {
  type: 'goal.created';
  goalId: string;
  userId: string;
  category: string;
}

export interface GoalUpdatedEvent extends DomainEvent {
  type: 'goal.updated';
  goalId: string;
  userId: string;
  status?: string;
  progress?: number;
}

export interface ExerciseCompletedEvent extends DomainEvent {
  type: 'exercise.completed';
  completionId: string;
  userId: string;
  exerciseId: string;
  exerciseType: string;
}

export interface MoodLoggedEvent extends DomainEvent {
  type: 'mood.logged';
  moodEntryId: string;
  userId: string;
  moodScore: number;
}

export interface InsightGeneratedEvent extends DomainEvent {
  type: 'insight.generated';
  insightId: string;
  userId: string;
  insightType: string;
}

export type AllDomainEvents =
  | SessionStartedEvent
  | SessionEndedEvent
  | MessageSentEvent
  | SafetyFlagRaisedEvent
  | JournalCreatedEvent
  | GoalCreatedEvent
  | GoalUpdatedEvent
  | ExerciseCompletedEvent
  | MoodLoggedEvent
  | InsightGeneratedEvent;

export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

class DomainEventBus {
  private emitter: EventEmitter;
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100); // Allow many listeners
  }

  on<T extends AllDomainEvents>(eventType: T['type'], handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as EventHandler);
    this.emitter.on(eventType, handler);
  }

  once<T extends AllDomainEvents>(eventType: T['type'], handler: EventHandler<T>): void {
    this.emitter.once(eventType, handler);
  }

  off<T extends AllDomainEvents>(eventType: T['type'], handler: EventHandler<T>): void {
    this.emitter.off(eventType, handler);
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler as EventHandler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  async emit<T extends AllDomainEvents>(event: T): Promise<void> {
    // Emit the event synchronously first
    this.emitter.emit(event.type, event);

    // Then handle async handlers
    const handlers = this.handlers.get(event.type) || [];
    const promises = handlers.map(handler => {
      try {
        return Promise.resolve(handler(event));
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }

  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.emitter.removeAllListeners(eventType);
      this.handlers.delete(eventType);
    } else {
      this.emitter.removeAllListeners();
      this.handlers.clear();
    }
  }
}

export const eventBus = new DomainEventBus();

export default eventBus;
