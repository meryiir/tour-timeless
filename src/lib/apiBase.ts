/**
 * API base URL (no trailing slash).
 *
 * - **Default `/api`:** Vite dev (proxy) and production when the SPA and API share one origin
 *   (e.g. nginx: `location /api { proxy_pass ... }`). Images use same origin via `/uploads`.
 * - **Override:** `VITE_API_URL` at **build time** when the API is on another host, e.g.
 *   `https://api.morocco-mosaic.com/api` (only if API is on another host).
 */
export function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  return "/api";
}

/**
 * Origin for resolving `/uploads/...` and similar (no trailing slash).
 * Empty string = same origin as the page (typical same-host deploy).
 */
export function getBackendPublicOrigin(): string {
  const env = import.meta.env.VITE_API_URL?.trim();
  if (env) {
    const withoutApi = env.replace(/\/api\/?$/i, "").replace(/\/$/, "");
    return withoutApi || "";
  }
  return "";
}
