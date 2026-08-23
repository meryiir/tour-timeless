/**
 * Public site origin for canonical URLs and JSON-LD (no trailing slash).
 * Set `VITE_SITE_URL` in production (e.g. https://morocco-mosaic.com).
 */
export const SUPPORTED_LANGS = ["en", "fr", "es", "de"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

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

/** Map browser/i18n codes (e.g. en-US) to a supported site language. */
export function normalizeLang(lang: string | null | undefined): SupportedLang {
  const raw = (lang || "en").trim().toLowerCase();
  if (raw.startsWith("en")) return "en";
  if ((SUPPORTED_LANGS as readonly string[]).includes(raw)) return raw as SupportedLang;
  return "en";
}

/** True when URL carries filter/facet params that should not be indexed. */
export function hasNonIndexableQueryParams(search: string): boolean {
  const params = new URLSearchParams(search);
  for (const key of params.keys()) {
    if (key !== "lang") return true;
  }
  return false;
}

/** Canonical public URL for a path + language (indexable pages). */
export function canonicalUrlForPath(path: string, lang: string | null | undefined): string {
  const base = absoluteUrl(path.startsWith("/") ? path : `/${path}`);
  return `${base}?lang=${normalizeLang(lang)}`;
}

/**
 * Build an absolute URL and ensure it contains `?lang=xx`.
 * Accepts either a site-relative path (starting with `/`) or an absolute URL on this origin.
 */
export function absoluteUrlWithLang(pathOrUrl: string, lang: string): string {
  const base = getSitePublicUrl();
  const isAbs = /^https?:\/\//i.test(pathOrUrl);
  const url = new URL(isAbs ? pathOrUrl : `${base}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`);
  url.searchParams.set("lang", normalizeLang(lang));
  return url.toString();
}
