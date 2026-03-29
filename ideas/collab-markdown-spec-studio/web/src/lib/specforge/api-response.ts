/**
 * Shared API response helpers for SpecForge routes.
 */

import { NextResponse } from "next/server";

/**
 * Return a success JSON response.
 */
export function success(
  data: Record<string, unknown>,
  options?: { status?: number },
): NextResponse {
  return NextResponse.json(
    { ok: true, ...data },
    { status: options?.status ?? 200 },
  );
}

/**
 * Return an error JSON response.
 */
export function error(
  message: string,
  code: string,
  status: number = 400,
): NextResponse {
  return NextResponse.json(
    { ok: false, error: { message, code } },
    { status },
  );
}
