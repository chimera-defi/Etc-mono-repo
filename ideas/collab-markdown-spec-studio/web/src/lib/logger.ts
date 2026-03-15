/**
 * Simple structured logging utility for SpecForge
 * Provides consistent error and event logging across the application
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

function formatLogEntry(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    entry.message,
  ];

  if (entry.context && Object.keys(entry.context).length > 0) {
    parts.push(`context=${JSON.stringify(entry.context)}`);
  }

  if (entry.error) {
    parts.push(`error=${entry.error.message}`);
    if (entry.error.stack) {
      parts.push(`stack=${entry.error.stack}`);
    }
  }

  return parts.join(" ");
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
  const entry: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    context,
    error,
  };

  const formatted = formatLogEntry(entry);

  // In production, this could be sent to a logging service
  if (level === "error") {
    console.error(formatted);
  } else if (level === "warn") {
    console.warn(formatted);
  } else if (level === "info") {
    console.info(formatted);
  } else {
    console.debug(formatted);
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, error?: Error, context?: Record<string, unknown>) =>
    log("error", message, context, error),
};
