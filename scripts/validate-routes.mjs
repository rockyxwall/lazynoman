#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import site from "../src/data/site.json" with { type: "json" };

const root = process.cwd();

// Verify critical dist files exist
for (const file of [
  "_headers",
  "_redirects",
  "index.json",
  "index.xml",
  "sitemap.xml",
  "404.html",
  "index.html",
]) {
  try {
    await stat(path.join(root, "dist", file));
  } catch {
    throw new Error(`dist is missing required file: ${file}`);
  }
}

// Verify search index
const search = JSON.parse(
  await readFile(path.join(root, "dist/index.json"), "utf8"),
);
if (!Array.isArray(search) || search.length === 0) {
  throw new Error("dist/index.json is empty or invalid");
}
for (const item of search) {
  for (const key of ["title", "tags", "categories", "contents", "permalink"]) {
    if (!(key in item)) throw new Error(`search entry is missing ${key}`);
  }
}

// Verify sitemap & RSS
const sitemap = await readFile(path.join(root, "dist/sitemap.xml"), "utf8");
const feed = await readFile(path.join(root, "dist/index.xml"), "utf8");

if (!sitemap.includes("<urlset") || !sitemap.includes(site.url)) {
  throw new Error("sitemap.xml is missing valid urlset or site url");
}
if (!feed.includes("<rss") || !feed.includes("<channel>")) {
  throw new Error("index.xml is missing valid rss channel structure");
}

// Verify HTML files for valid structure and absence of unresolved syntax
const htmlFiles = await fg("dist/**/*.html", { cwd: root, onlyFiles: true });
for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), "utf8");
  const visible = html
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, "")
    .replace(/<code\b[\s\S]*?<\/code>/gi, "");
  if (/\{\{(?:&lt;|<|%)/.test(visible)) {
    throw new Error(`${file} contains unresolved template syntax`);
  }
}

console.log(
  `Validated ${htmlFiles.length} HTML routes, ${search.length} search entries, sitemap.xml, and index.xml for LazyNoman.`,
);
