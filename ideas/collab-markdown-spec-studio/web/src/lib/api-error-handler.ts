/**
 * API Error Handler Utility
 * Converts SpecForge errors to appropriate HTTP responses with proper status codes
 */

import { NextResponse } from "next/server";
import { logger } from "./logger";
import { getErrorStatusCode, getErrorMessage } from "@/engine/errors";

/**
 * Safely wrap an async API handler with error handling
 * Converts SpecForgeError instances to proper HTTP responses
 * Logs all errors for visibility
 */
export async function withErrorHandling<T>(
  handler: () => Promise<T>,
  context?: { action?: string; resourceId?: string }
): Promise<NextResponse<{ error?: string; [key: string]: unknown }> | T> {
  try {
    return await handler();
  } catch (error) {
    const statusCode = getErrorStatusCode(error);
    const message = getErrorMessage(error);

    // Log the error for debugging
    logger.error(
      `API error: ${context?.action || "unknown action"}`,
      error instanceof Error ? error : new Error(String(error)),
      {
        statusCode,
        resourceId: context?.resourceId,
        message,
      }
    );

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
