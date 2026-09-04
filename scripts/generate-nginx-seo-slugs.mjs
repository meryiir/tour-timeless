import { writeFileSync } from "fs";
import { fetchSeoSlugs } from "./seo-fetch-slugs.mjs";

const { activitySlugs, destinationSlugs } = await fetchSeoSlugs();

function mapBlock(pathSegment, extractVar, validVar, slugs) {
  const lines = [
    `# Auto-generated — do not edit manually`,
    `map $uri $${extractVar} {`,
    `    default "";`,
    `    ~^/(?:en|fr|es|de)/${pathSegment}/([^/?]+)/?$ $1;`,
    `}`,
    `map $${extractVar} $${validVar} {`,
    `    default 0;`,
    `    "" 1;`,
  ];
  for (const slug of slugs) {
    lines.push(`    ${slug} 1;`);
  }
  lines.push(`}`, "");
  return lines.join("\n");
}

const conf = [
  mapBlock("activities", "seo_activity_slug", "seo_activity_slug_valid", activitySlugs),
  mapBlock("destinations", "seo_destination_slug", "seo_destination_slug_valid", destinationSlugs),
].join("\n");

writeFileSync("nginx-seo-slugs.conf", conf);
console.log(`nginx-seo-slugs.conf: ${activitySlugs.length} activities, ${destinationSlugs.length} destinations`);
