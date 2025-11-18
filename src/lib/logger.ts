type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private context: LogContext;

  constructor(defaultContext: LogContext = {}) {
    this.context = defaultContext;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const mergedContext = { ...this.context, ...context };
    const contextStr = Object.keys(mergedContext).length > 0
      ? ` ${JSON.stringify(mergedContext)}`
      : '';

    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = error instanceof Error
      ? { error: error.message, stack: error.stack, ...context }
      : { error, ...context };
    console.error(this.formatMessage('error', message, errorContext));
  }

  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }
}

export const logger = new Logger({
  service: 'mental-health-companion-core',
  environment: process.env.NODE_ENV || 'development',
});

export default logger;
