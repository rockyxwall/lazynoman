#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";
import { pathToFileURL } from "node:url";

export function slugify(value) {
  return value
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseMarkdownTable(markdown) {
  const lines = markdown.split(/\r?\n/);
  const data = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || trimmed.includes("|---")) continue;
    const parts = trimmed
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      const key = parts[0].replace(/\*\*/g, "").trim().toLowerCase();
      const val = parts.slice(1).join(" | ").trim();
      data[key] = val;
    }
  }

  const novel = {
    title: data["title"] || "",
  };

  if (data["associated names"]) {
    novel.associatedNames = data["associated names"]
      .split(/[,\n;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (data["author"]) novel.author = data["author"];
  if (data["type"]) novel.type = data["type"];
  if (data["language"]) novel.language = data["language"];
  if (data["year"]) {
    const y = Number.parseInt(data["year"], 10);
    novel.year = Number.isNaN(y) ? data["year"] : y;
  }
  if (data["status in coo"]) novel.statusInCoo = data["status in coo"];
  if (data["licensed"])
    novel.licensed = data["licensed"].toLowerCase() === "yes";
  if (data["translation"]) novel.translation = data["translation"];
  if (data["word count"]) novel.wordCount = data["word count"];

  if (data["original publisher"] || data["english publisher"]) {
    novel.publishers = {};
    if (data["original publisher"])
      novel.publishers.original = data["original publisher"];
    if (data["english publisher"])
      novel.publishers.english = data["english publisher"];
  }

  if (data["novelupdates rating"] || data["rating"]) {
    const rawRating = data["novelupdates rating"] || data["rating"];
    const match = rawRating.match(
      /([\d.]+)\s*\/\s*([\d.]+)(?:\s*\(([\d,]+)\s*votes\))?/i,
    );
    if (match) {
      novel.rating = {
        score: Number.parseFloat(match[1]),
        max: Number.parseFloat(match[2]),
        votes: match[3]
          ? Number.parseInt(match[3].replace(/,/g, ""), 10)
          : undefined,
        source: "NovelUpdates",
      };
    }
  }

  if (data["genre"]) {
    novel.genres = data["genre"]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (data["tags"]) {
    novel.tags = data["tags"]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (data["description"]) novel.description = data["description"];

  return novel;
}

export function parseNovelUpdatesHtml(html, url = "") {
  const extractText = (regex) => {
    const match = html.match(regex);
    if (!match) return "";
    return match[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const extractLinks = (containerRegex) => {
    const block = html.match(containerRegex);
    if (!block) return [];
    const links = [];
    for (const m of block[1].matchAll(/<a[^>]*>([^<]+)<\/a>/gi)) {
      links.push(m[1].trim());
    }
    return links.filter(Boolean);
  };

  const title =
    extractText(
      /<div[^>]*class=["'][^"']*seriestitlenou[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    ) || extractText(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

  const author = extractLinks(
    /<div[^>]*id=["']showauthors["'][^>]*>([\s\S]*?)<\/div>/i,
  ).join(", ");
  const type = extractText(
    /<div[^>]*id=["']showtype["'][^>]*>([\s\S]*?)<\/div>/i,
  );
  const language = extractText(
    /<div[^>]*id=["']showlang["'][^>]*>([\s\S]*?)<\/div>/i,
  );
  const yearStr = extractText(
    /<div[^>]*id=["']edityear["'][^>]*>([\s\S]*?)<\/div>/i,
  );
  const statusInCoo = extractText(
    /<div[^>]*id=["']editstatus["'][^>]*>([\s\S]*?)<\/div>/i,
  );
  const licensedStr = extractText(
    /<div[^>]*id=["']licensed["'][^>]*>([\s\S]*?)<\/div>/i,
  );
  const translation = extractText(
    /<div[^>]*id=["']showtranslated["'][^>]*>([\s\S]*?)<\/div>/i,
  );

  const orgPub = extractLinks(
    /<div[^>]*id=["']showorg["'][^>]*>([\s\S]*?)<\/div>/i,
  ).join(", ");
  const engPub = extractLinks(
    /<div[^>]*id=["']showepub["'][^>]*>([\s\S]*?)<\/div>/i,
  ).join(", ");

  const rawAssoc = extractText(
    /<div[^>]*id=["']editassociated["'][^>]*>([\s\S]*?)<\/div>/i,
  );
  const associatedNames = rawAssoc
    ? rawAssoc
        .split(/\s*<br\s*\/?>\s*|\s*;\s*|\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const genres = extractLinks(
    /<div[^>]*id=["']seriesgenre["'][^>]*>([\s\S]*?)<\/div>/i,
  );
  const tags = extractLinks(
    /<div[^>]*id=["']showtags["'][^>]*>([\s\S]*?)<\/div>/i,
  );

  let description = extractText(
    /<div[^>]*id=["']editdescription["'][^>]*>([\s\S]*?)<\/div>/i,
  );
  description = description.replace(/^description\s*/i, "").trim();

  // Rating
  let rating;
  const ratingMatch = html.match(
    /class=["'][^"']*my_rating[^"']*["'][^>]*>([\d.]+)<[\s\S]*?\(([\d,]+)\s*votes\)/i,
  );
  if (ratingMatch) {
    rating = {
      score: Number.parseFloat(ratingMatch[1]),
      max: 5.0,
      votes: Number.parseInt(ratingMatch[2].replace(/,/g, ""), 10),
      source: "NovelUpdates",
    };
  }

  const novel = {
    title: title || "Unknown Title",
    associatedNames: associatedNames.length > 0 ? associatedNames : undefined,
    author: author || undefined,
    type: type || undefined,
    language: language || undefined,
    year: yearStr
      ? Number.isNaN(Number.parseInt(yearStr, 10))
        ? yearStr
        : Number.parseInt(yearStr, 10)
      : undefined,
    statusInCoo: statusInCoo || undefined,
    licensed: licensedStr
      ? licensedStr.toLowerCase().includes("yes")
      : undefined,
    translation: translation || undefined,
    publishers:
      orgPub || engPub
        ? { original: orgPub || undefined, english: engPub || undefined }
        : undefined,
    rating: rating || undefined,
    sourceUrl: url || undefined,
    genres: genres.length > 0 ? genres : undefined,
    tags: tags.length > 0 ? tags : undefined,
    description: description || undefined,
  };

  return novel;
}

export function parseRoyalRoadHtml(html, url = "") {
  const extractText = (regex) => {
    const match = html.match(regex);
    if (!match) return "";
    return match[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const title =
    extractText(
      /<h1[^>]*class=["'][^"']*font-white[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i,
    ) || extractText(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const author = extractText(
    /<h4[^>]*class=["'][^"']*font-white[^"']*["'][^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/i,
  );
  const description = extractText(
    /<div[^>]*class=["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
  );

  const tags = [];
  for (const m of html.matchAll(
    /<span[^>]*class=["'][^"']*badge[^"']*["'][^>]*>([^<]+)<\/span>/gi,
  )) {
    const tag = m[1].trim();
    if (tag && !tags.includes(tag)) tags.push(tag);
  }

  return {
    title: title || "Unknown Title",
    author: author || undefined,
    type: "Web Novel (EN)",
    language: "English",
    sourceUrl: url || undefined,
    genres: tags.slice(0, 5),
    tags: tags.slice(5),
    description: description || undefined,
  };
}

export async function fetchHtmlWithPlaywright(url, headful = false) {
  let playwright;
  try {
    playwright = await import("playwright");
  } catch {
    throw new Error(
      "Playwright is not installed. Use --html <file> or install playwright.",
    );
  }

  console.log(
    `Launching ${headful ? "visible" : "headless"} browser to fetch ${url}...`,
  );
  const browser = await playwright.chromium.launch({ headless: !headful });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    let pageTitle = await page.title();

    if (
      pageTitle.includes("Just a moment...") ||
      pageTitle.includes("Cloudflare")
    ) {
      console.log(
        "\x1b[33mCloudflare challenge detected.\x1b[0m Waiting up to 15s for verification...",
      );
      if (!headful) {
        console.log(
          "Tip: If challenge does not clear, re-run with --headful to solve manually.",
        );
      }
      await page.waitForTimeout(6000);
      pageTitle = await page.title();
    }

    const html = await page.content();
    await browser.close();
    return html;
  } catch (err) {
    await browser.close();
    throw err;
  }
}

export function extractSlugFromUrl(url) {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.replace(/\/+$/, "");
    const parts = pathname.split("/").filter(Boolean);

    // /series/<slug>
    if (parts.includes("series") && parts[parts.indexOf("series") + 1]) {
      return slugify(parts[parts.indexOf("series") + 1]);
    }
    // /fiction/<id>/<slug>
    if (parts.includes("fiction") && parts.length >= 3) {
      return slugify(parts[2]);
    }
    // last segment
    if (parts.length > 0) {
      return slugify(parts[parts.length - 1]);
    }
  } catch {
    // fallback
  }
  return "";
}

export async function main(argv = process.argv.slice(2), root = process.cwd()) {
  let url = "";
  let slug = "";
  let htmlFile = "";
  let fromTableFile = "";
  let headful = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--slug" && argv[i + 1]) {
      slug = argv[i + 1];
      i++;
    } else if (arg === "--html" && argv[i + 1]) {
      htmlFile = argv[i + 1];
      i++;
    } else if (arg === "--from-table" && argv[i + 1]) {
      fromTableFile = argv[i + 1];
      i++;
    } else if (arg === "--headful") {
      headful = true;
    } else if (!arg.startsWith("--") && !url) {
      url = arg;
    }
  }

  if (!url && !htmlFile && !fromTableFile) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    url = (await rl.question("Novel URL (or file path): ")).trim();
    if (!slug) {
      const inputSlug = (
        await rl.question("Novel Slug (leave empty to auto-detect): ")
      ).trim();
      if (inputSlug) slug = inputSlug;
    }
    rl.close();
  }

  let novelData;

  if (fromTableFile) {
    const filePath = path.resolve(root, fromTableFile);
    console.log(`Reading Markdown table from ${filePath}...`);
    const md = await readFile(filePath, "utf8");
    novelData = parseMarkdownTable(md);
    if (!slug) {
      slug = path.basename(filePath, path.extname(filePath));
    }
  } else if (htmlFile) {
    const filePath = path.resolve(root, htmlFile);
    console.log(`Parsing local HTML from ${filePath}...`);
    const html = await readFile(filePath, "utf8");
    if (url.includes("royalroad.com") || html.includes("royalroad.com")) {
      novelData = parseRoyalRoadHtml(html, url);
    } else {
      novelData = parseNovelUpdatesHtml(html, url);
    }
  } else if (url) {
    const html = await fetchHtmlWithPlaywright(url, headful);
    if (url.includes("royalroad.com")) {
      novelData = parseRoyalRoadHtml(html, url);
    } else {
      novelData = parseNovelUpdatesHtml(html, url);
    }
  } else {
    throw new Error("No URL, HTML file, or table source provided.");
  }

  if (!slug) {
    slug = extractSlugFromUrl(url) || slugify(novelData.title);
  }

  if (!slug) {
    throw new Error("Could not determine slug. Specify --slug <name>.");
  }

  const outDir = path.join(root, "src/data/novels");
  await mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, `${slug}.json`);

  await writeFile(outFile, JSON.stringify(novelData, null, 2) + "\n", "utf8");

  console.log(
    `\n\x1b[32m✓ Saved\x1b[0m \x1b[1m${path.relative(root, outFile)}\x1b[0m`,
  );
  console.log(`  Title: \x1b[36m${novelData.title}\x1b[0m`);
  if (novelData.author) console.log(`  Author: ${novelData.author}`);
  if (novelData.genres) console.log(`  Genres: ${novelData.genres.join(", ")}`);
  if (novelData.tags) console.log(`  Tags count: ${novelData.tags.length}`);
  console.log(`\n\x1b[90mAdd this to your review post frontmatter:\x1b[0m`);
  console.log(`  \x1b[33mnovel: ${slug}\x1b[0m\n`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((err) => {
    console.error(`\x1b[31mError:\x1b[0m ${err.message}`);
    process.exitCode = 1;
  });
}
