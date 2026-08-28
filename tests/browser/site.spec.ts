import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page, baseURL }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(baseURL!).origin) await route.abort();
    else await route.continue();
  });
});

for (const path of [
  "/",
  "/comprehension-ability-creating-and-teaching-the-dao-in-various-worlds/",
  "/categories/novel/",
  "/posts/",
  "/search/",
]) {
  test(`primary page ${path} has no serious accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator("main h1").first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .exclude("iframe")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(
      results.violations,
      results.violations
        .map((violation) => `${violation.id}: ${violation.help}`)
        .join("\n"),
    ).toEqual([]);
  });
}

test("theme choice persists across navigation", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
  const before = await page.locator("html").getAttribute("data-theme");
  await page.getByRole("button", { name: /switch to/i }).click();
  const expected = before === "light" ? "dark" : "light";
  await expect(page.locator("html")).toHaveAttribute("data-theme", expected);
  await page.goto("/posts/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", expected);
});

test("first taxonomy image is prioritized and later images remain lazy", async ({
  page,
}) => {
  await page.goto("/categories/novel/");
  const images = page.locator(".post-grid .card img");
  await expect(images.first()).toHaveAttribute("loading", "eager");
  await expect(images.first()).toHaveAttribute("fetchpriority", "high");
  await expect(images.first()).not.toHaveAttribute("srcset", /.+/);
  await expect(images.nth(1)).toHaveAttribute("loading", "lazy");
  await expect(images.nth(1)).toHaveAttribute("data-cf-image", "");
  await expect(images.nth(1)).toHaveAttribute("src", /\/images\//);
});

test("listing cards use the compact mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/categories/novel/");
  const firstCard = page.locator(".listing-page .card").first();
  await expect(firstCard.locator(".card-body > p:not(.meta)")).toBeVisible();
  await expect(firstCard.locator(".card-body > .chips")).toBeVisible();
  await expect(firstCard).toHaveCSS("display", "grid");
  await expect(firstCard).toHaveCSS("grid-template-columns", /^112px /);
  await expect(firstCard.locator("img")).toHaveCSS("width", "112px");
  await expect(firstCard.locator("img")).toHaveCSS("height", "112px");

  await page.setViewportSize({ width: 320, height: 844 });
  await expect(firstCard).toHaveCSS("grid-template-columns", /^88px /);
  await expect(firstCard.locator("img")).toHaveCSS("width", "88px");
  await expect(firstCard.locator(".card-body > p:not(.meta)")).toBeVisible();
  expect(
    await firstCard.evaluate((card) => card.scrollWidth <= card.clientWidth),
  ).toBe(true);

  await page.setViewportSize({ width: 900, height: 900 });
  await expect(firstCard.locator(".card-body > p:not(.meta)")).toBeVisible();
  await expect(firstCard.locator(".card-body > .chips")).toBeVisible();
  await expect(firstCard).toHaveCSS("display", "block");
  await expect(firstCard.locator("img")).toHaveCSS("aspect-ratio", "16 / 9");
  expect(
    await firstCard.locator("img").evaluate((image) => image.clientWidth),
  ).toBeGreaterThan(112);
});

test("article exposes navigation and interactions", async ({
  page,
  isMobile,
}) => {
  await page.goto(
    "/comprehension-ability-creating-and-teaching-the-dao-in-various-worlds/",
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Comprehension Ability",
  );
  const toc = page.locator("[data-responsive-toc]");
  await expect(toc).toBeVisible();
  if (isMobile) await toc.locator("summary").click();
  await expect(toc.locator("[data-toc]")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
  const image = page.locator(".article-image");
  await expect(image).toHaveAttribute("src", /\/images\//);
  await expect(page.locator("[data-comments]")).toBeVisible();
  await expect(page.locator("[data-ad-slot]")).toBeVisible();
});

test("article table of contents stays pinned while scrolling on desktop", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "the mobile table of contents is intentionally inline");
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto(
    "/comprehension-ability-creating-and-teaching-the-dao-in-various-worlds/",
  );
  const toc = page.locator(".article-toc");
  await expect(toc).toHaveCSS("position", "sticky");
  const stickyTop = await toc.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).top),
  );
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  await expect
    .poll(() => toc.evaluate((element) => element.getBoundingClientRect().top))
    .toBeCloseTo(stickyTop, 0);
});

test("search returns generated index results", async ({ page }) => {
  await page.goto("/search/");
  await page.getByLabel("Search articles").fill("Dao");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator("[data-search-status]")).toContainText(/result/i);
  await expect(
    page.locator("[data-search-results] article").first(),
  ).toBeVisible();

  await page.getByLabel("Search articles").fill("");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator("[data-search-results] article")).toHaveCount(0);
  await expect(page.locator("[data-search-status]")).toHaveText(
    "Enter a search term.",
  );
});

test("clearing search ignores a delayed completion", async ({ page }) => {
  let release!: () => void;
  const delayed = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/index.json", async (route) => {
    await delayed;
    await route.continue();
  });
  await page.goto("/search/");
  await page.getByLabel("Search articles").fill("Dao");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator("[data-search-status]")).toHaveText(
    "Loading search index...",
  );
  await page.getByLabel("Search articles").fill("");
  await page.getByRole("button", { name: "Search" }).click();
  release();
  await expect(page.locator("[data-search-status]")).toHaveText(
    "Enter a search term.",
  );
  await expect(page.locator("[data-search-results] article")).toHaveCount(0);
});

test("homepage and article lists preserve heading levels and lazy images", async ({
  page,
}) => {
  await page.goto("/");
  const latest = page
    .getByRole("heading", { name: "Latest articles" })
    .locator("..");
  await expect(latest.locator(".post-grid .card h3").first()).toBeVisible();
  await expect(latest.locator(".post-grid .card img").first()).toHaveAttribute(
    "loading",
    "lazy",
  );
});

test("the not-found page resolves", async ({ page }) => {
  const response = await page.goto("/definitely-not-a-real-page/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("404");
});

test("keyboard users can reach the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("mobile navigation opens with an accessible control", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile project only");
  await page.goto("/");
  const button = page.getByRole("button", { name: "Menu" });
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("link", { name: "Articles", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Topics", exact: true }),
  ).toBeVisible();
});
