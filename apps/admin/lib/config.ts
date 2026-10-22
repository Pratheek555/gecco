/** Validate without returning connection strings or secret values to the browser. */
export function signInConfigurationError(env: Record<string, string | undefined> = process.env): string | null {
  if (!env.DATABASE_URL?.trim()) return "HQ sign-in is not configured. Set DATABASE_URL in the admin app environment and restart the server.";
  try {
    const url = new URL(env.DATABASE_URL);
    if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error("protocol");
  } catch {
    return "HQ sign-in is not configured. DATABASE_URL must be a valid PostgreSQL connection URL.";
  }
  if (!env.PLATFORM_ADMIN_EMAILS?.trim()) return "HQ sign-in is not configured. Set PLATFORM_ADMIN_EMAILS to the existing staff accounts allowed to enter.";
  if (!env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length < 32) return "HQ sign-in is not configured. Set ADMIN_SESSION_SECRET to at least 32 characters.";
  return null;
}
