import { readFileSync, writeFileSync } from "fs";
import { spawnSync } from "child_process";

const routes = JSON.parse(readFileSync("prerender-routes.json", "utf8"));
const pkgPath = "package.json";
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
pkg.reactSnap = pkg.reactSnap || {};
pkg.reactSnap.routes = routes;
const chromiumPath = process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium";
pkg.reactSnap.puppeteerExecutablePath = chromiumPath;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`Running react-snap for ${routes.length} routes...`);
const result = spawnSync("npx", ["react-snap"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
  },
});

process.exit(result.status ?? 1);
