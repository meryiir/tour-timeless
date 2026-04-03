/**
 * Returns the maps URL to use in iframes / links. If the user pasted a full
 * <iframe src="..."> snippet, extracts the src URL.
 */
export function normalizeGoogleMapsEmbedUrl(input: string | undefined | null): string {
  if (!input?.trim()) return "";
  let s = input.trim();
  const srcMatch = s.match(/src\s*=\s*["']([^"']+)["']/i);
  if (srcMatch?.[1]) s = srcMatch[1].trim();
  return s;
}

export function isGoogleMapsEmbedUrl(url: string): boolean {
  const u = normalizeGoogleMapsEmbedUrl(url);
  return u.includes("/maps/embed") && /[?&]pb=/.test(u);
}

/** Short links (goo.gl) and share URLs need server-side resolution to build an embed iframe src. */
export function shouldTryResolveMapUrl(url: string): boolean {
  const u = normalizeGoogleMapsEmbedUrl(url);
  if (!u.startsWith("https://")) return false;
  try {
    const host = new URL(u).hostname.toLowerCase();
    if (host === "goo.gl" || host.endsWith(".goo.gl")) return true;
    if (host.includes("google.com") && u.includes("/maps")) return true;
    return false;
  } catch {
    return false;
  }
}
