/**
 * Parse the httpOnly session cookie set by /api/auth/login.
 */
export function getSessionUser(req) {
  const sessionCookie = req.cookies.get("session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}
