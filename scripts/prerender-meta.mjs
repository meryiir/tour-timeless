/**
 * Static SEO HTML generation: inject title, description, canonical, hreflang
 * into the Vite-built index.html for each public route (no Puppeteer).
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { buildPrerenderRoutes, fetchSeoSlugs } from "./seo-fetch-slugs.mjs";

const SITE_URL = (process.env.VITE_SITE_URL || "https://marrocos-tours.com").replace(/\/$/, "");
const API_BASE = (process.env.SEO_API_BASE || process.env.VITE_API_URL || `${SITE_URL}/api`).replace(/\/$/, "");
const LANGS = ["en", "fr", "es", "de"];
const DIST = "dist";

const en = JSON.parse(readFileSync("src/i18n/locales/en.json", "utf8"));

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function canonicalUrl(path, lang = "en") {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}/${lang}${p === "/" ? "" : p}`;
}

function buildHeadExtras({ title, description, path, lang = "en", robots = "index, follow" }) {
  const canonical = canonicalUrl(path, lang);
  const hreflang = LANGS.map(
    (lang) => `<link rel="alternate" hreflang="${lang}" href="${escapeHtml(canonicalUrl(path, lang))}" />`,
  ).join("\n    ");
  const xDefault = `<link rel="alternate" hreflang="x-default" href="${escapeHtml(canonicalUrl(path, "en"))}" />`;

  return `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    ${hreflang}
    ${xDefault}
    <meta name="robots" content="${robots}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />`;
}

function injectHtml(baseHtml, headExtras) {
  let html = baseHtml;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, "");
  html = html.replace(/<meta name="description"[^>]*>/i, "");
  html = html.replace(/<meta property="og:title"[^>]*>/i, "");
  html = html.replace(/<meta property="og:description"[^>]*>/i, "");
  html = html.replace(/<meta property="og:url"[^>]*>/i, "");
  return html.replace("</head>", `    ${headExtras}\n  </head>`);
}

function writeRouteHtml(baseHtml, routePath, meta) {
  for (const lang of LANGS) {
    const routeDir =
      routePath === "/"
        ? join(DIST, lang)
        : join(DIST, lang, routePath.replace(/^\//, ""));
    mkdirSync(routeDir, { recursive: true });
    const localizedBaseHtml = baseHtml.replace(/<html lang="[^"]*">/i, `<html lang="${lang}">`);
    const html = injectHtml(localizedBaseHtml, buildHeadExtras({ ...meta, path: routePath, lang }));
    writeFileSync(join(routeDir, "index.html"), html, "utf8");
  }
}

function staticMeta(routePath) {
  const map = {
    "/": { title: en.seo.home.title, description: en.seo.home.description },
    "/activities": { title: en.seo.activities.title, description: en.seo.activities.description },
    "/destinations": { title: en.seo.destinations.title, description: en.seo.destinations.description },
    "/about": { title: en.seo.about.title, description: en.seo.about.description },
    "/contact": { title: en.seo.contact.title, description: en.seo.contact.description },
    "/blog": {
      title: "Morocco Travel Blog | Sahara Tours, Marrakech & Itineraries",
      description: "Practical Morocco travel guides for Sahara desert tours, Marrakech day trips, Agafay, Merzouga and 7 to 12-day Morocco itineraries.",
    },
    "/privacy": { title: en.seo.privacy.title, description: en.seo.privacy.description },
    "/terms": { title: en.seo.terms.title, description: en.seo.terms.description },
  };
  return map[routePath];
}

const { activitySlugs, destinationSlugs } = await fetchSeoSlugs();
const routes = buildPrerenderRoutes(activitySlugs, destinationSlugs);
const baseHtml = readFileSync(join(DIST, "index.html"), "utf8");

const [actsRes, destsRes] = await Promise.all([
  fetch(`${API_BASE}/activities?page=0&size=500&lang=en`),
  fetch(`${API_BASE}/destinations?page=0&size=500&lang=en`),
]);
const acts = (await actsRes.json()).content || [];
const dests = (await destsRes.json()).content || [];

for (const routePath of routes) {
  const staticPage = staticMeta(routePath);
  if (staticPage) {
    writeRouteHtml(baseHtml, routePath, staticPage);
    continue;
  }

  const actMatch = routePath.match(/^\/activities\/(.+)$/);
  if (actMatch) {
    const act = acts.find((a) => a.slug === actMatch[1]);
    if (!act) continue;
    const desc = (act.shortDescription || act.fullDescription || "").slice(0, 160);
    writeRouteHtml(baseHtml, routePath, {
      title: `${act.title} | ${en.seo.siteName}`,
      description: desc,
    });
    continue;
  }

  const destMatch = routePath.match(/^\/destinations\/(.+)$/);
  if (destMatch) {
    const dest = dests.find((d) => d.slug === destMatch[1]);
    if (!dest) continue;
    const desc = (dest.shortDescription || dest.fullDescription || "").slice(0, 160);
    writeRouteHtml(baseHtml, routePath, {
      title: `${dest.name} | ${en.seo.siteName}`,
      description: desc,
    });
  }
}

console.log(`Prerendered SEO HTML for ${routes.length} routes`);
