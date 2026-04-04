/**
 * Public site origin for canonical URLs and JSON-LD (no trailing slash).
 * Set `VITE_SITE_URL` in production (e.g. https://www.example.com).
 */
export function getSitePublicUrl(): string {
  const env = import.meta.env.VITE_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return "http://localhost:5173";
}

/** Absolute URL for a path starting with `/`. */
export function absoluteUrl(path: string): string {
  const base = getSitePublicUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
