/**
 * Fetch public activity/destination slugs for SEO build steps (prerender + nginx).
 */
const API_BASE = (process.env.SEO_API_BASE || process.env.VITE_API_URL || "https://morocco-mosaic.com/api").replace(/\/$/, "");

export async function fetchSeoSlugs() {
  const [actsRes, destsRes] = await Promise.all([
    fetch(`${API_BASE}/activities?page=0&size=500&lang=en`),
    fetch(`${API_BASE}/destinations?page=0&size=500&lang=en`),
  ]);

  if (!actsRes.ok) {
    throw new Error(`Failed to fetch activities: ${actsRes.status} ${actsRes.statusText}`);
  }
  if (!destsRes.ok) {
    throw new Error(`Failed to fetch destinations: ${destsRes.status} ${destsRes.statusText}`);
  }

  const acts = await actsRes.json();
  const dests = await destsRes.json();

  const activitySlugs = (acts.content || [])
    .map((a) => a.slug)
    .filter(Boolean);
  const destinationSlugs = (dests.content || [])
    .map((d) => d.slug)
    .filter(Boolean);

  return { activitySlugs, destinationSlugs, API_BASE };
}

export function buildPrerenderRoutes(activitySlugs, destinationSlugs) {
  const staticRoutes = [
    "/",
    "/about",
    "/contact",
    "/activities",
    "/destinations",
    "/privacy",
    "/terms",
  ];
  return [
    ...staticRoutes,
    ...activitySlugs.map((slug) => `/activities/${slug}`),
    ...destinationSlugs.map((slug) => `/destinations/${slug}`),
  ];
}
