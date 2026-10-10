// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — Pino Enterprise Logger
// Structured, JSON/Pretty logging with request tracing context
// ──────────────────────────────────────────────────────────────

import pino, { Logger, LoggerOptions } from 'pino';
import { envConfig } from '../config';

export interface RequestLogContext {
  requestId: string;
  traceId: string;
  userId?: string;
  incidentId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  durationMs?: number;
  ip?: string;
  userAgent?: string;
  [key: string]: unknown;
}

const isDev = envConfig.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDev ? 'debug' : 'info');

const pinoOptions: LoggerOptions = {
  level: logLevel,
  base: {
    env: envConfig.NODE_ENV,
    app: 'earthmind-pios',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  redact: {
    paths: ['password', 'passwordHash', 'token', 'authorization', 'cookie', 'secret', 'creditCard'],
    censor: '[REDACTED]',
  },
};

// Instantiated Pino root logger with pretty transport in development
export const pinoInstance: Logger = isDev
  ? pino({
      ...pinoOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname,env,app',
        },
      },
    })
  : pino(pinoOptions);

// ── App Logger Wrapper ─────────────────────────────────────────
export class EnterpriseLogger {
  constructor(private readonly logger: Logger = pinoInstance) {}

  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(context || {}, message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(context || {}, message);
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    const errObj = error instanceof Error
      ? { err: { message: error.message, name: error.name, stack: error.stack } }
      : { error };
    this.logger.error({ ...errObj, ...(context || {}) }, message);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(context || {}, message);
  }

  fatal(message: string, error?: unknown, context?: Record<string, unknown>): void {
    const errObj = error instanceof Error
      ? { err: { message: error.message, name: error.name, stack: error.stack } }
      : { error };
    this.logger.fatal({ ...errObj, ...(context || {}) }, message);
  }

  // ── Child logger bound to specific request metadata ───────────
  child(context: RequestLogContext): EnterpriseLogger {
    return new EnterpriseLogger(this.logger.child(context));
  }

  // ── Specialized request cycle logger ──────────────────────────
  logRequest(context: RequestLogContext, message = 'API Request Processed'): void {
    const level = (context.statusCode && context.statusCode >= 500)
      ? 'error'
      : (context.statusCode && context.statusCode >= 400)
        ? 'warn'
        : 'info';

    this.logger[level](
      {
        requestId: context.requestId,
        traceId: context.traceId,
        userId: context.userId ?? 'anonymous',
        incidentId: context.incidentId ?? 'n/a',
        method: context.method,
        url: context.url,
        statusCode: context.statusCode,
        durationMs: context.durationMs,
        ip: context.ip,
        userAgent: context.userAgent,
      },
      `${message}: ${context.method} ${context.url} -> ${context.statusCode} (${context.durationMs}ms)`
    );
  }
}

export const logger = new EnterpriseLogger();
export default logger;
