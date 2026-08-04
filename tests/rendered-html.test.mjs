import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the complete Instituto Horizonte experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Instituto Horizonte/);
  assert.match(html, /Tu curiosidad tiene/);
  assert.match(html, /Áreas de aprendizaje/i);
  assert.match(html, /Agenda tu visita/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships the seven scrollsequence videos and supplied keyframes", async () => {
  const videos = ["core", "orbit", "learning", "classroom", "frames", "community", "future"];
  const images = ["student-life.jpg", "student-life-alt.jpg", "future-campus.jpg"];
  await Promise.all([
    ...videos.map((name) => access(new URL(`../public/media/horizonte-${name}.mp4`, import.meta.url))),
    ...images.map((name) => access(new URL(`../public/images/${name}`, import.meta.url))),
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/favicon.png", import.meta.url)),
  ]);
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.equal((page.match(/video:\s*"\/media\/horizonte-/g) ?? []).length, 7);
  assert.match(page, /stageOpacity|requestAnimationFrame/);
  assert.match(page, /prefers-reduced-motion|modal-open/);
});

test("keeps generated asset requests inside the GitHub Pages repository path", async () => {
  const assetsDirectory = new URL("../.github-pages/assets/", import.meta.url);
  const files = await readdir(assetsDirectory);
  const generatedTextAssets = files.filter((file) => /\.(?:css|m?js)$/.test(file));
  assert.ok(generatedTextAssets.length > 0);

  const contents = await Promise.all(
    generatedTextAssets.map((file) => readFile(new URL(file, assetsDirectory), "utf8")),
  );

  for (const content of contents) {
    assert.doesNotMatch(content, /(?<!\/Instituto-Horizonte-Final)\/assets\//);
  }
});
