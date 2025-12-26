// Structured logging with correlation ID support
// Constitution Principle IV: Traceability & Auditability
// Feature 011: Enhanced with automatic correlation ID injection

import { getTraceContext } from './telemetry.js';

interface LogContext {
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  blobName?: string;
  modelName?: string;
  [key: string]: unknown;
}

class Logger {
  /**
   * Inject current trace context into log context
   */
  private static injectTraceContext(context?: LogContext): LogContext {
    const traceContext = getTraceContext();
    
    return {
      ...context,
      // Only add if not already provided
      correlationId: context?.correlationId ?? traceContext?.correlationId,
      traceId: context?.traceId ?? traceContext?.traceId,
      spanId: context?.spanId ?? traceContext?.spanId,
    };
  }

  private static formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const enrichedContext = this.injectTraceContext(context);
    const logEntry = {
      timestamp,
      level,
      message,
      ...enrichedContext,
    };
    return JSON.stringify(logEntry);
  }

  static info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('INFO', message, context));
  }

  static warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('WARN', message, context));
  }

  static error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error?.message,
      stack: error?.stack,
    };
    console.error(this.formatMessage('ERROR', message, errorContext));
  }

  static debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }
}

export { Logger, LogContext };
