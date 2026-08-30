#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";
import { pathToFileURL } from "node:url";

import YAML from "yaml";

import site from "../src/data/site.json" with { type: "json" };
import { assertCandidateAvailable } from "./route-contract.mjs";

export function slugify(title) {
  return title
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function chicagoToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: site.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${value.year}-${value.month}-${value.day}`;
}

export function parseArguments(argv) {
  if (
    argv.length === 0 ||
    argv.includes("-i") ||
    argv.includes("--interactive")
  ) {
    return null;
  }

  let title;
  let startIndex = 0;

  if (!argv[0].startsWith("--")) {
    title = argv[0];
    startIndex = 1;
  }

  let date;
  let draft = true;
  const categories = [];
  const tags = [];

  for (let index = startIndex; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];

    if (flag === "--title" && value) {
      title = value;
      index += 1;
      continue;
    }
    if (flag === "--date" && value) {
      date = value;
      index += 1;
      continue;
    }
    if (flag === "--category" && value) {
      categories.push(value);
      index += 1;
      continue;
    }
    if (flag === "--tag" && value) {
      tags.push(value);
      index += 1;
      continue;
    }
    if (flag === "--draft") {
      draft = true;
      continue;
    }
    if (flag === "--no-draft" || flag === "--published") {
      draft = false;
      continue;
    }
    throw new Error(`unknown or incomplete option: ${flag}`);
  }

  if (!title) {
    throw new Error(
      'usage: npm run new:post -- "[title]" [--date YYYY-MM-DD] [--category "<name>" ...] [--tag "<name>" ...] [--draft|--no-draft]',
    );
  }

  return {
    title,
    date: date ?? chicagoToday(),
    categories,
    tags,
    draft,
  };
}

import readline from "node:readline";
import fg from "fast-glob";

export async function getExistingTags(root = process.cwd()) {
  const files = await fg("src/content/posts/**/*.md", {
    cwd: root,
    onlyFiles: true,
  });
  const tagsSet = new Set();
  for (const file of files) {
    try {
      const content = await readFile(path.join(root, file), "utf8");
      const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) continue;
      const parsed = YAML.parse(match[1]);
      if (Array.isArray(parsed?.tags)) {
        for (const tag of parsed.tags) {
          if (typeof tag === "string" && tag.trim()) tagsSet.add(tag.trim());
        }
      }
    } catch {}
  }
  return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
}

async function promptMultiSelect(message, items, defaultChecked = []) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "at least one --category is required in non-interactive use",
    );
  }

  return new Promise((resolve) => {
    let cursor = 0;
    const selected = new Set(defaultChecked);

    console.log(
      `\n\x1b[32m? \x1b[0m\x1b[1m${message}\x1b[0m \x1b[90m(↑/↓: navigate, Space: select/deselect, Enter: confirm)\x1b[0m`,
    );

    function render(isFirst = false) {
      if (!isFirst) {
        readline.moveCursor(process.stdout, 0, -items.length);
      }
      items.forEach((item, index) => {
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
        const isCursor = index === cursor;
        const isChecked = selected.has(item);
        const pointer = isCursor ? "\x1b[36m❯\x1b[0m" : " ";
        const box = isChecked ? "\x1b[32m[●]\x1b[0m" : "\x1b[90m[ ]\x1b[0m";
        const label = isCursor ? `\x1b[1m\x1b[36m${item}\x1b[0m` : item;
        process.stdout.write(`  ${pointer} ${box} ${label}\n`);
      });
    }

    process.stdout.write("\x1b[?25l");
    render(true);

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();

    function cleanup() {
      process.stdout.write("\x1b[?25h");
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.removeListener("keypress", onKeypress);
    }

    function onKeypress(_str, key) {
      if (!key) return;

      if (key.ctrl && key.name === "c") {
        cleanup();
        process.stdout.write("\n");
        process.exit(130);
      }

      if (key.name === "up" || key.name === "k") {
        cursor = (cursor - 1 + items.length) % items.length;
        render(false);
      } else if (key.name === "down" || key.name === "j") {
        cursor = (cursor + 1) % items.length;
        render(false);
      } else if (key.name === "space") {
        const item = items[cursor];
        if (selected.has(item)) {
          selected.delete(item);
        } else {
          selected.add(item);
        }
        render(false);
      } else if (key.name === "return" || key.name === "enter") {
        if (selected.size === 0) {
          return;
        }
        cleanup();
        readline.moveCursor(process.stdout, 0, -items.length);
        readline.cursorTo(process.stdout, 0);
        readline.clearScreenDown(process.stdout);
        const chosen = items.filter((item) => selected.has(item));
        console.log(
          `  \x1b[90mSelected categories:\x1b[0m \x1b[32m${chosen.join(", ")}\x1b[0m`,
        );
        resolve(chosen);
      }
    }

    process.stdin.on("keypress", onKeypress);
  });
}

async function promptSearchableMultiSelect({
  message,
  items,
  allowNew = true,
  defaultChecked = [],
  maxVisible = 6,
}) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return defaultChecked;
  }

  return new Promise((resolve) => {
    let cursor = 0;
    let searchQuery = "";
    const selected = new Set(defaultChecked);
    const totalLines = maxVisible + 2;

    console.log(
      `\n\x1b[32m? \x1b[0m\x1b[1m${message}\x1b[0m \x1b[90m(Type to filter, Space/Tab: toggle, ↑/↓: move, Enter: confirm)\x1b[0m`,
    );

    function getFiltered() {
      const q = searchQuery.trim().toLowerCase();
      let matched = items.filter((item) => item.toLowerCase().includes(q));
      if (allowNew && q && !matched.some((item) => item.toLowerCase() === q)) {
        matched = [...matched, `+ Add "${searchQuery.trim()}"`];
      }
      return matched;
    }

    function render(isFirst = false) {
      if (!isFirst) {
        readline.moveCursor(process.stdout, 0, -totalLines);
      }

      const filtered = getFiltered();
      if (cursor >= filtered.length) {
        cursor = Math.max(0, filtered.length - 1);
      }

      let scrollOffset = 0;
      if (cursor >= maxVisible) {
        scrollOffset = cursor - maxVisible + 1;
      }
      const visible = filtered.slice(scrollOffset, scrollOffset + maxVisible);

      // Line 1: Filter input
      readline.cursorTo(process.stdout, 0);
      readline.clearLine(process.stdout, 0);
      process.stdout.write(
        `  \x1b[90mFilter:\x1b[0m ${searchQuery}\x1b[36m_\x1b[0m\n`,
      );

      // Lines 2 to maxVisible + 1: Items
      for (let i = 0; i < maxVisible; i += 1) {
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
        if (i < visible.length) {
          const item = visible[i];
          const actualIndex = scrollOffset + i;
          const isCursor = actualIndex === cursor;
          const isNewOption = item.startsWith('+ Add "');
          const valueName = isNewOption ? item.slice(7, -1) : item;
          const isChecked = selected.has(valueName);

          const pointer = isCursor ? "\x1b[36m❯\x1b[0m" : " ";
          const box = isChecked ? "\x1b[32m[●]\x1b[0m" : "\x1b[90m[ ]\x1b[0m";
          const label = isCursor
            ? `\x1b[1m\x1b[36m${item}\x1b[0m`
            : isNewOption
              ? `\x1b[33m${item}\x1b[0m`
              : item;
          process.stdout.write(`  ${pointer} ${box} ${label}\n`);
        } else {
          process.stdout.write("\n");
        }
      }

      // Line maxVisible + 2: Footer / selected preview
      readline.cursorTo(process.stdout, 0);
      readline.clearLine(process.stdout, 0);
      const selectedList = Array.from(selected);
      const preview =
        selectedList.length > 0
          ? `\x1b[90mSelected (${selectedList.length}):\x1b[0m \x1b[32m${selectedList.join(", ")}\x1b[0m`
          : "\x1b[90m(None selected)\x1b[0m";
      process.stdout.write(`  ${preview}\n`);
    }

    process.stdout.write("\x1b[?25l");
    render(true);

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();

    function cleanup() {
      process.stdout.write("\x1b[?25h");
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.removeListener("keypress", onKeypress);
    }

    function onKeypress(str, key) {
      if (!key) return;

      if (key.ctrl && key.name === "c") {
        cleanup();
        process.stdout.write("\n");
        process.exit(130);
      }

      const filtered = getFiltered();

      if (key.name === "up") {
        if (filtered.length > 0) {
          cursor = (cursor - 1 + filtered.length) % filtered.length;
        }
        render(false);
      } else if (key.name === "down") {
        if (filtered.length > 0) {
          cursor = (cursor + 1) % filtered.length;
        }
        render(false);
      } else if (key.name === "space" || key.name === "tab") {
        if (filtered.length > 0 && cursor < filtered.length) {
          const item = filtered[cursor];
          const valueName = item.startsWith('+ Add "')
            ? item.slice(7, -1)
            : item;
          if (selected.has(valueName)) {
            selected.delete(valueName);
          } else {
            selected.add(valueName);
          }
        }
        render(false);
      } else if (key.name === "backspace") {
        if (searchQuery.length > 0) {
          searchQuery = searchQuery.slice(0, -1);
          cursor = 0;
          render(false);
        }
      } else if (key.name === "escape") {
        searchQuery = "";
        cursor = 0;
        render(false);
      } else if (key.name === "return" || key.name === "enter") {
        cleanup();
        readline.moveCursor(process.stdout, 0, -totalLines);
        readline.cursorTo(process.stdout, 0);
        readline.clearScreenDown(process.stdout);
        const chosen = Array.from(selected);
        console.log(
          `  \x1b[90mSelected tags:\x1b[0m \x1b[32m${chosen.length > 0 ? chosen.join(", ") : "(none)"}\x1b[0m`,
        );
        resolve(chosen);
      } else if (
        str &&
        str.length === 1 &&
        !key.ctrl &&
        !key.meta &&
        /^[\w\s-]$/.test(str)
      ) {
        searchQuery += str;
        cursor = 0;
        render(false);
      }
    }

    process.stdin.on("keypress", onKeypress);
  });
}

async function promptWizard() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      'usage: npm run new:post -- "<title>" [--date YYYY-MM-DD] [--category "<name>" ...] [--tag "<name>" ...] [--draft|--no-draft]',
    );
  }

  console.log("\n\x1b[1m\x1b[36m=== Create New Post ===\x1b[0m\n");

  // 1. Title
  const titlePrompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let title = "";
  try {
    while (!title) {
      const answer = (
        await titlePrompt.question("\x1b[32m? \x1b[0m\x1b[1mTitle:\x1b[0m ")
      ).trim();
      if (!answer) {
        console.log("  \x1b[31mTitle is required.\x1b[0m");
        continue;
      }
      const slug = slugify(answer);
      if (!slug) {
        console.log(
          "  \x1b[31mTitle does not produce a usable ASCII slug.\x1b[0m",
        );
        continue;
      }
      title = answer;
    }
  } finally {
    titlePrompt.close();
  }

  // 2. Categories (Interactive Space/Enter multiselect)
  const categories = await promptMultiSelect("Categories:", site.categories);

  // 3. Tags (Searchable Multi-select from existing + custom)
  const existingTags = await getExistingTags();
  const tags = await promptSearchableMultiSelect({
    message: "Tags (searchable):",
    items: existingTags,
    allowNew: true,
  });

  // 4. Date & Draft
  const extraPrompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let date = chicagoToday();
  let draft = true;

  try {
    const dateInput = (
      await extraPrompt.question(
        `\n\x1b[32m? \x1b[0m\x1b[1mDate [default: ${date}]:\x1b[0m `,
      )
    ).trim();
    if (dateInput) date = dateInput;

    const draftInput = (
      await extraPrompt.question(
        "\n\x1b[32m? \x1b[0m\x1b[1mSave as draft? (Y/n) [default: Y]:\x1b[0m ",
      )
    )
      .trim()
      .toLowerCase();
    draft = draftInput !== "n" && draftInput !== "no";
  } finally {
    extraPrompt.close();
  }

  return { title, date, categories, tags, draft };
}

async function promptCategories() {
  return promptMultiSelect("Categories:", site.categories);
}

export function validateInput({ title, date, categories, tags = [] }) {
  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00Z`)
    : undefined;
  if (
    !parsedDate ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    throw new Error(
      "date must be a real calendar date in strict YYYY-MM-DD form",
    );
  }
  const slug = slugify(title);
  if (!slug) throw new Error("title does not produce a usable ASCII slug");
  if (categories.length === 0)
    throw new Error("at least one category is required");
  if (new Set(categories).size !== categories.length)
    throw new Error("categories must not contain duplicates");
  for (const category of categories)
    if (!site.categories.includes(category))
      throw new Error(`invalid category: ${category}`);
  if (new Set(tags).size !== tags.length)
    throw new Error("tags must not contain duplicates");
  return slug;
}

export function renderTemplate(
  template,
  { title, date, categories, tags = [], draft = true },
  slug,
) {
  const renderedTags =
    tags.length === 0
      ? "[]"
      : "\n" + tags.map((tag) => `  - ${JSON.stringify(tag)}`).join("\n");

  return template
    .replaceAll("{{TITLE}}", () => JSON.stringify(title))
    .replaceAll("{{DATE}}", date)
    .replaceAll("{{YEAR}}", date.slice(0, 4))
    .replaceAll("{{SLUG}}", slug)
    .replaceAll("{{DRAFT}}", draft ? "true" : "false")
    .replaceAll("{{TAGS}}", renderedTags)
    .replaceAll(
      "{{CATEGORIES}}",
      categories
        .map((category) => `  - ${JSON.stringify(category)}`)
        .join("\n"),
    );
}

export async function main(argv = process.argv.slice(2), root = process.cwd()) {
  let input = parseArguments(argv);
  if (!input) {
    input = await promptWizard();
  } else if (input.categories.length === 0) {
    input.categories = await promptCategories();
  }

  const slug = validateInput(input);
  const destination = path.join(
    root,
    "src/content/posts",
    input.date.slice(0, 4),
    `${slug}.md`,
  );
  try {
    await access(destination);
    throw new Error(`refusing to overwrite ${destination}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const candidate = {
    title: input.title,
    date: input.date,
    url: `/${slug}/`,
    image: `images/${input.date.slice(0, 4)}-thumbs/${slug}.webp`,
    categories: input.categories,
    tags: input.tags ?? [],
    draft: input.draft ?? true,
  };
  await assertCandidateAvailable(candidate, root);
  const template = await readFile(
    path.join(root, "templates/post.md.tmpl"),
    "utf8",
  );
  const output = renderTemplate(template, input, slug);
  const match = output.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const parsed = YAML.parse(match[1]);
  if (parsed.title !== input.title)
    throw new Error("generated title failed exact YAML round trip");
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, output, { encoding: "utf8", flag: "wx" });
  console.log(`\n\x1b[32m✓\x1b[0m Created \x1b[1m${destination}\x1b[0m`);
  console.log(`  \x1b[90mURL:\x1b[0m /${slug}/`);
  console.log(
    `  \x1b[90mDraft:\x1b[0m ${input.draft ? "true (view with 'npm run dev:content')" : "false"}`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
