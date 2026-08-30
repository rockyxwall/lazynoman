import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import YAML from "yaml";
import { afterEach, describe, expect, it } from "vitest";

import site from "../../src/data/site.json" with { type: "json" };
import {
  chicagoToday,
  getExistingTags,
  main,
  parseArguments,
  renderTemplate,
  slugify,
  validateInput,
} from "../../scripts/new-post.mjs";
import {
  assertCandidateAvailable,
  buildInventory,
  emittedPath,
  publicOutputPath,
  redirectMatches,
  routeKey,
} from "../../scripts/route-contract.mjs";

const temporaryRoots = [];

async function fixture(publicFiles = ["index.html"], redirects = "") {
  const root = await mkdtemp(path.join(tmpdir(), "website-scaffolder-"));
  temporaryRoots.push(root);
  await Promise.all([
    mkdir(path.join(root, "src/content/posts"), { recursive: true }),
    mkdir(path.join(root, "public"), { recursive: true }),
    mkdir(path.join(root, "templates"), { recursive: true }),
  ]);
  await writeFile(path.join(root, "public/_redirects"), redirects);
  await writeFile(
    path.join(root, "templates/post.md.tmpl"),
    await readFile("templates/post.md.tmpl", "utf8"),
  );
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("post scaffolder", () => {
  it("generates deterministic dates and slugs", () => {
    expect(chicagoToday(new Date("2026-01-01T03:00:00Z"))).toBe("2025-12-31");
    expect(
      slugify("  Lord of the Mysteries: Review & System Analysis!  "),
    ).toBe("lord-of-the-mysteries-review-system-analysis");
  });

  it("accepts canonical categories including Novel and Recommendations", () => {
    const input = parseArguments([
      "A post",
      "--date",
      "2026-08-13",
      "--category",
      "Novel",
      "--category",
      "Recommendations",
    ]);
    expect(validateInput(input)).toBe("a-post");
    expect(input.categories).toEqual(["Novel", "Recommendations"]);
  });

  it("rejects duplicate category flags", () => {
    const input = parseArguments([
      "A post",
      "--date",
      "2026-08-13",
      "--category",
      "Novel",
      "--category",
      "Novel",
    ]);
    expect(() => validateInput(input)).toThrow("must not contain duplicates");
  });

  it.each(["Linux", "Windows", "Not Real"])(
    "rejects invalid new category %s",
    (category) => {
      expect(() =>
        validateInput({
          title: "Post",
          date: "2026-08-13",
          categories: [category],
        }),
      ).toThrow("invalid category");
    },
  );

  it("presents and accepts every canonical category", () => {
    for (const category of site.categories) {
      expect(() =>
        validateInput({
          title: category,
          date: "2026-08-13",
          categories: [category],
        }),
      ).not.toThrow();
    }
  });

  it("rejects missing categories and impossible calendar dates", () => {
    expect(() =>
      validateInput({ title: "Post", date: "2026-08-13", categories: [] }),
    ).toThrow("at least one category");
    expect(() =>
      validateInput({
        title: "Post",
        date: "2026-02-30",
        categories: ["Novel"],
      }),
    ).toThrow("real calendar date");
  });

  it("round trips YAML metacharacters exactly", async () => {
    const title = 'Review: # rank "quote" \\ slash $& $$ $` $\'\nnext';
    const input = { title, date: "2026-08-13", categories: ["Novel"] };
    const template = await readFile("templates/post.md.tmpl", "utf8");
    const output = renderTemplate(template, input, slugify(title));
    const header = output.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1];
    expect(YAML.parse(header).title).toBe(title);
    expect(output).toContain("draft: true");
    expect(output).toContain("<!--more-->");
  });

  it("normalizes routes without changing case", () => {
    expect(routeKey("Post//")).toBe("/Post/");
    expect(emittedPath("/foo/")).toBe("foo/index.html");
    expect(publicOutputPath("/categories/novel/index.xml")).toBe(
      "categories/novel/index.xml",
    );
    expect(redirectMatches("/guides/:slug", "/guides/novel/")).toBe(true);
    expect(redirectMatches("/legacy/*", "/legacy/a/b/")).toBe(true);
  });

  it("rejects an existing route and accepts a new unique route", async () => {
    await expect(
      assertCandidateAvailable({
        title: "Duplicate",
        date: "2026-08-13",
        url: "/i-read-every-system-novel-so-you-dont-have-to-my-personal-rankings/",
        categories: ["Novel"],
        tags: [],
      }),
    ).rejects.toThrow("URL collision");
    await expect(
      assertCandidateAvailable({
        title: "Unique",
        date: "2099-01-01",
        url: "/vitest-unique-novel-review/",
        categories: ["Novel"],
        tags: [],
      }),
    ).resolves.toBeUndefined();
  });

  it("virtually induces taxonomy, feed, alias, and pagination routes", async () => {
    const root = await fixture();
    const inventory = await buildInventory(
      {
        title: "New Review",
        date: "2026-08-13",
        url: "/new-review/",
        categories: ["Novel"],
        tags: ["Cultivation"],
      },
      root,
    );
    expect([...inventory.induced]).toEqual(
      expect.arrayContaining([
        "/new-review/",
        "/categories/novel/",
        "/categories/novel/index.xml",
        "/tags/cultivation/",
        "/tags/cultivation/index.xml",
      ]),
    );
  });

  it("detects exact, wildcard, and parameterized redirect overlap", async () => {
    for (const source of [
      "/blocked/ /target/ 301\n",
      "/blocked/* /target/ 301\n",
      "/:slug /target/ 301\n",
    ]) {
      const root = await fixture(["index.html"], source);
      await expect(
        assertCandidateAvailable(
          {
            title: "Blocked",
            date: "2026-08-13",
            url: "/blocked/",
            categories: ["Novel"],
            tags: [],
          },
          root,
        ),
      ).rejects.toThrow("overlaps redirect source");
    }
  });

  it("normalizes trailing slashes while preserving route case", async () => {
    const root = await fixture(["index.html"]);
    await writeFile(
      path.join(root, "src/content/posts/existing.md"),
      `---\ntitle: Existing\ndate: "2026-08-01"\nurl: /Post/\ncategories: [Novel]\ntags: []\n---\n`,
    );
    await expect(
      assertCandidateAvailable(
        {
          title: "Same",
          date: "2026-08-13",
          url: "Post//",
          categories: ["Novel"],
          tags: [],
        },
        root,
      ),
    ).rejects.toThrow("URL collision");
  });

  it("rejects static output conflicts", async () => {
    const exact = await fixture();
    await mkdir(path.join(exact, "public/asset"), { recursive: true });
    await writeFile(path.join(exact, "public/asset/index.html"), "static");
    await expect(
      assertCandidateAvailable(
        {
          title: "Asset",
          date: "2026-08-13",
          url: "/asset/",
          categories: ["Novel"],
          tags: [],
        },
        exact,
      ),
    ).rejects.toThrow(/collision/);
  });

  it("induces collection pagination at the page boundary", async () => {
    const root = await fixture();
    for (let index = 0; index < 10; index += 1) {
      await writeFile(
        path.join(root, "src/content/posts", `post-${index}.md`),
        `---\ntitle: Post ${index}\ndate: "2026-08-01"\nurl: /post-${index}/\ncategories: [Novel]\ntags: []\n---\n`,
      );
    }
    const inventory = await buildInventory(
      {
        title: "Eleventh",
        date: "2026-08-13",
        url: "/eleventh/",
        categories: ["Novel"],
        tags: [],
      },
      root,
    );
    expect([...inventory.induced]).toEqual(
      expect.arrayContaining(["/posts/page/2/", "/categories/novel/page/2/"]),
    );
  });

  it("writes the schema-compatible output once and refuses overwrite", async () => {
    const root = await fixture();
    const args = ["Safe: Post", "--date", "2026-08-13", "--category", "Novel"];
    await main(args, root);
    const output = await readFile(
      path.join(root, "src/content/posts/2026/safe-post.md"),
      "utf8",
    );
    expect(
      YAML.parse(output.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]),
    ).toMatchObject({
      title: "Safe: Post",
      date: "2026-08-13",
      url: "/safe-post/",
      categories: ["Novel"],
      draft: true,
    });
    await expect(main(args, root)).rejects.toThrow("refusing to overwrite");
  });

  it("handles empty args and interactive flags as wizard triggers", () => {
    expect(parseArguments([])).toBeNull();
    expect(parseArguments(["-i"])).toBeNull();
    expect(parseArguments(["--interactive"])).toBeNull();
  });

  it("supports tags, draft flags, and renders custom frontmatter correctly", async () => {
    const input = parseArguments([
      "Custom Post",
      "--date",
      "2026-08-13",
      "--category",
      "Novel",
      "--tag",
      "Cultivation",
      "--tag",
      "System",
      "--no-draft",
    ]);
    expect(input).toMatchObject({
      title: "Custom Post",
      date: "2026-08-13",
      categories: ["Novel"],
      tags: ["Cultivation", "System"],
      draft: false,
    });
    const template = await readFile("templates/post.md.tmpl", "utf8");
    const output = renderTemplate(template, input, slugify(input.title));
    const header = YAML.parse(output.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
    expect(header).toMatchObject({
      title: "Custom Post",
      date: "2026-08-13",
      url: "/custom-post/",
      categories: ["Novel"],
      tags: ["Cultivation", "System"],
      draft: false,
    });
  });

  it("extracts existing tags from content posts", async () => {
    const root = await fixture();
    await writeFile(
      path.join(root, "src/content/posts/test-post.md"),
      `---\ntitle: T\ndate: "2026-08-13"\nurl: /t/\ncategories: [Novel]\ntags:\n  - "Cultivation"\n  - "System"\n---\n`,
    );
    const tags = await getExistingTags(root);
    expect(tags).toEqual(["Cultivation", "System"]);
  });
});

