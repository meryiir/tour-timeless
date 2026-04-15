/**
 * Public site origin for canonical URLs and JSON-LD (no trailing slash).
 * Set `VITE_SITE_URL` in production (e.g. https://morocco-mosaic.com).
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

/**
 * Build an absolute URL and ensure it contains `?lang=xx`.
 * Accepts either a site-relative path (starting with `/`) or an absolute URL on this origin.
 */
export function absoluteUrlWithLang(pathOrUrl: string, lang: string): string {
  const base = getSitePublicUrl();
  const isAbs = /^https?:\/\//i.test(pathOrUrl);
  const url = new URL(isAbs ? pathOrUrl : `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`);
  if (!url.searchParams.get("lang")) url.searchParams.set("lang", lang);
  return url.toString();
}
