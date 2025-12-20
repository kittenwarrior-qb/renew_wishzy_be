import { Logger as NestLogger } from '@nestjs/common';

/**
 * Custom Logger Utility
 * Provides structured logging with different log levels
 * Can be extended to send logs to external services
 */
export class AppLogger {
  private logger: NestLogger;
  private context: string;

  constructor(context: string) {
    this.logger = new NestLogger(context);
    this.context = context;
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(message, ...args);
    }
  }

  log(message: string, ...args: any[]): void {
    this.logger.log(message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }

  error(message: string, trace?: string, ...args: any[]): void {
    this.logger.error(message, trace, ...args);
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, etc.)
    }
  }

  // Convenience methods
  apiRequest(method: string, endpoint: string, params?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.debug(`[${method}] ${endpoint}`, params ? { params } : '');
    }
  }

  apiResponse(endpoint: string, data: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.debug(`Response [${endpoint}]:`, data);
    }
  }

  apiError(endpoint: string, error: any): void {
    this.error(`Error [${endpoint}]:`, error?.stack || error);
  }
}

