/**
 * SpecForge Error Types
 * Defines structured errors with appropriate HTTP status codes for API routes
 */

/**
 * Base error class for SpecForge with HTTP status code
 */
export class SpecForgeError extends Error {
  public statusCode = 500;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, SpecForgeError.prototype);
  }
}

/**
 * Resource not found (HTTP 404)
 */
export class NotFoundError extends SpecForgeError {
  public statusCode = 404;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict / version mismatch (HTTP 409)
 * Used for stale patches or concurrent modification conflicts
 */
export class ConflictError extends SpecForgeError {
  public statusCode = 409;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Validation error (HTTP 400)
 * Invalid input, malformed request, or constraint violation
 */
export class ValidationError extends SpecForgeError {
  public statusCode = 400;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Patch is stale / out of date (HTTP 409)
 * The base version of a patch doesn't match the current document version
 */
export class StaleError extends SpecForgeError {
  public statusCode = 409;

  constructor(message: string, public baseVersion?: number, public currentVersion?: number) {
    super(message);
    Object.setPrototypeOf(this, StaleError.prototype);
  }
}

/**
 * Unauthorized / permission denied (HTTP 403)
 */
export class PermissionError extends SpecForgeError {
  public statusCode = 403;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

/**
 * Determine HTTP status code from error
 * Falls back to 500 if error is not a recognized SpecForgeError
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof SpecForgeError) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Determine error message
 * Safely extracts message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Internal server error";
}
