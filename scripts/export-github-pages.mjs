import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientRoot = path.join(projectRoot, "dist", "client");
const outputRoot = path.join(projectRoot, ".github-pages");
const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] || "instituto-horizonte-final";
const basePath = (process.env.PAGES_BASE_PATH || `/${repository}`).replace(/\/$/, "");
const siteOrigin = process.env.PAGES_ORIGIN || "https://leoncenteno2009-sudo.github.io";

const textExtensions = new Set([".css", ".html", ".js", ".json", ".map", ".txt", ".xml"]);
const rootAssets = ["/assets/", "/media/", "/images/", "/og.png", "/favicon.png"];

function withPagesBase(input) {
  const escapedBase = basePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedOrigin = siteOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const baseSegment = basePath.slice(1);
  let result = input;
  for (const asset of rootAssets) {
    const escapedAsset = asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(`(?<!${escapedBase})${escapedAsset}`, "g"), `${basePath}${asset}`);
  }
  result = result.replace(new RegExp(`${escapedOrigin}/(?!${baseSegment}/)`, "g"), `${siteOrigin}${basePath}/`);
  return result;
}

async function rewriteTree(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return rewriteTree(absolute);
    if (!textExtensions.has(path.extname(entry.name))) return;
    const source = await readFile(absolute, "utf8");
    const rewritten = withPagesBase(source);
    if (rewritten !== source) await writeFile(absolute, rewritten);
  }));
}

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await cp(clientRoot, outputRoot, { recursive: true });

const workerUrl = pathToFileURL(path.join(projectRoot, "dist", "server", "index.js"));
workerUrl.searchParams.set("pages-export", Date.now().toString());
const { default: worker } = await import(workerUrl.href);
const response = await worker.fetch(
  new Request(`${siteOrigin}/`, { headers: { accept: "text/html" } }),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok) throw new Error(`No se pudo renderizar la página: ${response.status}`);
const html = await response.text();
await writeFile(path.join(outputRoot, "index.html"), html);
await writeFile(path.join(outputRoot, "404.html"), html);
await writeFile(path.join(outputRoot, ".nojekyll"), "");
await rewriteTree(outputRoot);

const exportedHtml = await readFile(path.join(outputRoot, "index.html"), "utf8");
for (const asset of rootAssets) {
  if (exportedHtml.includes(`\"${asset}`) || exportedHtml.includes(`='${asset}`)) {
    throw new Error(`Quedó una referencia sin base de Pages: ${asset}`);
  }
}

console.log(`GitHub Pages export ready at ${outputRoot}`);
