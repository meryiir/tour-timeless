/**
 * Returns a safe in-app path for post-login navigation, or null if invalid.
 * Rejects open-redirect patterns (e.g. //evil.com, absolute URLs).
 */
export function getSafeRedirectPath(redirectParam: string | null): string | null {
  if (redirectParam == null || redirectParam === "") return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(redirectParam);
  } catch {
    return null;
  }
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return null;
  if (decoded.includes("://") || decoded.toLowerCase().startsWith("/\\")) return null;
  return decoded;
}

export function navigateAfterAuth(
  navigate: (to: string) => void,
  redirectParam: string | null,
  fallback = "/",
) {
  const path = getSafeRedirectPath(redirectParam) ?? fallback;
  navigate(path);
}
