/**
 * In Vite dev, default to same-origin `/api` so the dev server can proxy to Spring Boot
 * (avoids net::ERR_CONNECTION_REFUSED when the backend is briefly down while :5173 is up).
 * Set VITE_API_URL in .env to override (e.g. full URL for a remote API).
 */
export function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  if (import.meta.env.DEV) return "/api";
  return "http://localhost:8081/api";
}

/** Origin used for static paths like `/uploads/...` (empty = same origin as the SPA, proxied in dev). */
export function getBackendPublicOrigin(): string {
  const env = import.meta.env.VITE_API_URL?.trim();
  if (env) {
    const withoutApi = env.replace(/\/api\/?$/i, "").replace(/\/$/, "");
    return withoutApi || "http://localhost:8081";
  }
  if (import.meta.env.DEV) return "";
  return "http://localhost:8081";
}
