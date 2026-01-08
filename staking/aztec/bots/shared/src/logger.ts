import pino from 'pino';

export interface LogContext {
  service?: string;
  txHash?: string;
  address?: string;
  amount?: string;
  error?: Error;
  [key: string]: unknown;
}

const baseLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function createLogger(serviceName: string) {
  const childLogger = baseLogger.child({ service: serviceName });

  return {
    info: (message: string, context?: LogContext) => {
      childLogger.info(context || {}, message);
    },

    error: (message: string, error: Error, context?: LogContext) => {
      childLogger.error(
        {
          ...context,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        },
        message
      );
    },

    warn: (message: string, context?: LogContext) => {
      childLogger.warn(context || {}, message);
    },

    debug: (message: string, context?: LogContext) => {
      childLogger.debug(context || {}, message);
    },

    child: (context: LogContext) => {
      return createLogger(context.service || serviceName);
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;
