/**
 * Escape special regex characters in a string.
 * Used to safely include user input in regex patterns.
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
