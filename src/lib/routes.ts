import type { Page, Post } from "./content";
import { pageRoute, slugify, taxonomy } from "./content";
import site from "../data/site.json";

type Listing = {
  title: string;
  description?: string;
  posts: Post[];
  page: number;
  pages: number;
  base: string;
};

export type PageDescriptor =
  | { kind: "post"; route: string; post: Post }
  | { kind: "page"; route: string; page: Page }
  | { kind: "listing"; route: string; listing: Listing }
  | {
      kind: "terms";
      route: string;
      root: string;
      title: string;
      terms: Array<{ name: string; slug: string; count: number }>;
      page: number;
      pages: number;
    }
  | { kind: "redirect"; route: string; target: string };

function routeKey(route: string): string {
  const segments = route.split("/").filter(Boolean);
  return segments.length === 0 ? "/" : `/${segments.join("/")}/`;
}

function addPaginated(
  output: PageDescriptor[],
  seen: Set<string>,
  base: string,
  title: string,
  posts: Post[],
  description?: string,
  minimumPages = 1,
) {
  const pages = Math.max(
    minimumPages,
    Math.ceil(posts.length / site.postsPerPage),
  );
  for (let page = 1; page <= pages; page += 1) {
    const route = page === 1 ? base : `${base}page/${page}/`;
    const key = routeKey(route);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push({
      kind: "listing",
      route: key,
      listing: {
        title,
        description,
        posts: posts.slice(
          (page - 1) * site.postsPerPage,
          page * site.postsPerPage,
        ),
        page,
        pages,
        base,
      },
    });
  }
}

function addTermPages(
  output: PageDescriptor[],
  seen: Set<string>,
  root: string,
  title: string,
  terms: Array<{ name: string; slug: string; count: number }>,
) {
  const key = routeKey(root);
  if (seen.has(key)) return;
  seen.add(key);
  output.push({
    kind: "terms",
    route: key,
    root,
    title,
    page: 1,
    pages: 1,
    terms,
  });
}

export function buildPageDescriptors(
  posts: Post[],
  pages: Page[],
): PageDescriptor[] {
  const output: PageDescriptor[] = [];
  const seen = new Set<string>(["/"]);
  const reserved = new Set(["/search/", "/newsletter/", "/rss/"]);

  for (const post of posts) {
    const route = routeKey(post.data.url);
    if (seen.has(route)) throw new Error(`duplicate emitted route ${route}`);
    seen.add(route);
    output.push({ kind: "post", route, post });
  }
  for (const page of pages) {
    const route = routeKey(pageRoute(page));
    if (reserved.has(route)) continue;
    if (seen.has(route)) throw new Error(`duplicate emitted route ${route}`);
    seen.add(route);
    output.push({ kind: "page", route, page });
  }

  addPaginated(
    output,
    seen,
    "/posts/",
    "Articles",
    posts,
    "Webnovel reviews, tier lists, and recommendations",
  );
  addPaginated(output, seen, "/", "Latest Reviews", posts, undefined, 1);

  for (const field of ["categories", "tags"] as const) {
    const groups = taxonomy(posts, field);
    const root = `/${field}/`;
    const terms = [...groups.entries()]
      .map(([slug, group]) => ({
        name: group.name,
        slug,
        count: group.posts.length,
      }))
      .sort((left, right) => left.name.localeCompare(right.name));
    addTermPages(
      output,
      seen,
      root,
      field === "categories" ? "Topics" : "Tags",
      terms,
    );
    for (const [slug, group] of groups) {
      addPaginated(output, seen, `${root}${slug}/`, group.name, group.posts);
    }
  }

  return output;
}

export function routeParam(route: string): string {
  return route.replace(/^\/+|\/+$/g, "");
}

export function emittedHtmlPath(route: string): string {
  const key = routeKey(route);
  return key === "/" ? "index.html" : `${key.slice(1)}index.html`;
}

export { routeKey, slugify };
