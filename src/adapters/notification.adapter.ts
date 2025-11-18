import logger from '../lib/logger';

export interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface INotificationAdapter {
  send(payload: NotificationPayload): Promise<boolean>;
  sendBatch(payloads: NotificationPayload[]): Promise<boolean[]>;
}

/**
 * In-memory notification adapter (logs only, for development)
 */
export class InMemoryNotificationAdapter implements INotificationAdapter {
  private sentNotifications: NotificationPayload[] = [];

  async send(payload: NotificationPayload): Promise<boolean> {
    logger.info('Notification sent', {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
    });

    this.sentNotifications.push(payload);
    return true;
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<boolean[]> {
    return Promise.all(payloads.map(p => this.send(p)));
  }

  getSentNotifications(): NotificationPayload[] {
    return [...this.sentNotifications];
  }

  clear(): void {
    this.sentNotifications = [];
  }
}

/**
 * Email notification adapter (stub implementation)
 */
export class EmailNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload): Promise<boolean> {
    // In production, integrate with SendGrid, AWS SES, etc.
    logger.info('Email notification would be sent', {
      userId: payload.userId,
      title: payload.title,
    });
    return true;
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<boolean[]> {
    return Promise.all(payloads.map(p => this.send(p)));
  }
}

/**
 * Push notification adapter (stub implementation)
 */
export class PushNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload): Promise<boolean> {
    // In production, integrate with FCM, APNs, OneSignal, etc.
    logger.info('Push notification would be sent', {
      userId: payload.userId,
      title: payload.title,
    });
    return true;
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<boolean[]> {
    return Promise.all(payloads.map(p => this.send(p)));
  }
}

// Factory and registry
class NotificationAdapterRegistry {
  private adapters: Map<string, INotificationAdapter> = new Map();
  private defaultAdapter: INotificationAdapter;

  constructor() {
    // Register default adapter
    this.defaultAdapter = new InMemoryNotificationAdapter();
    this.register('in-memory', this.defaultAdapter);
    this.register('email', new EmailNotificationAdapter());
    this.register('push', new PushNotificationAdapter());
  }

  register(name: string, adapter: INotificationAdapter): void {
    this.adapters.set(name, adapter);
  }

  get(name: string): INotificationAdapter {
    return this.adapters.get(name) || this.defaultAdapter;
  }

  getDefault(): INotificationAdapter {
    return this.defaultAdapter;
  }
}

export const notificationRegistry = new NotificationAdapterRegistry();
