import { writeFileSync } from "fs";
import { buildPrerenderRoutes, fetchSeoSlugs } from "./seo-fetch-slugs.mjs";

const { activitySlugs, destinationSlugs } = await fetchSeoSlugs();
const routes = buildPrerenderRoutes(activitySlugs, destinationSlugs);
writeFileSync("prerender-routes.json", JSON.stringify(routes, null, 2));
console.log(`Prerender routes: ${routes.length} (${activitySlugs.length} activities, ${destinationSlugs.length} destinations)`);
