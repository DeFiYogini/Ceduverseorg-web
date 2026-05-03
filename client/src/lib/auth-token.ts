// Auth tokens now live in an httpOnly cookie (`cedu_token`) set by the server.
// These helpers remain for backward compatibility with ~50 call sites that still
// read a token to send via Authorization header. During the transition:
//  - getAuthToken still reads any legacy localStorage token (stale sessions keep working)
//  - setAuthToken is a no-op (new tokens never persist to localStorage)
//  - clearAuthToken removes the legacy token (best-effort cleanup on logout)
const TOKEN_KEY = "cedu_token";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(_token: string): void {
  // no-op: server now sets an httpOnly cookie. We intentionally do not persist
  // the token in localStorage to prevent XSS exfiltration.
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}
