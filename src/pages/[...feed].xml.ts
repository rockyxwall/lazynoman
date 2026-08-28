import rss from "@astrojs/rss";
import type { APIRoute, GetStaticPaths } from "astro";

import {
  getPublishedPosts,
  feedContent,
  feedPublicationDate,
  publicationTime,
  site,
  taxonomy,
  taxonomySlug,
} from "../lib/content";

export const getStaticPaths = (async () => {
  const posts = await getPublishedPosts();
  const paths = new Set<string>([
    "posts/index.xml",
    "categories/index.xml",
    "tags/index.xml",
  ]);
  for (const field of ["categories", "tags"] as const) {
    for (const slug of taxonomy(posts, field).keys()) {
      paths.add(`${field}/${slug}/index.xml`);
    }
  }
  return [...paths].map((path) => ({
    params: { feed: path.replace(/\.xml$/, "") },
    props: { path },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async (context) => {
  const path = String(context.props.path);
  const channelUrl = new URL(
    `/${path.replace(/index\.xml$/, "")}`,
    context.site,
  );
  let posts = await getPublishedPosts();
  const taxonomyRoot = path.match(/^(categories|tags)\/index\.xml$/)?.[1] as
    "categories" | "tags" | undefined;
  if (taxonomyRoot) {
    const groups = taxonomy(posts, taxonomyRoot);
    return rss({
      title: `${taxonomyRoot} on ${site.name}`,
      description: `Recent content in ${taxonomyRoot} on ${site.name}`,
      site: channelUrl,
      customData: "<language>en-US</language>",
      items: [...groups.entries()]
        .sort(
          ([, left], [, right]) =>
            publicationTime(right.posts[0]) - publicationTime(left.posts[0]) ||
            left.name.localeCompare(right.name, "en-US", {
              sensitivity: "base",
            }),
        )
        .map(([slug, group]) => ({
          title: group.name.toLocaleLowerCase("en-US"),
          link: new URL(`/${taxonomyRoot}/${slug}/`, context.site).toString(),
          pubDate: new Date(
            group.posts[0].data.date.length === 10
              ? `${group.posts[0].data.date}T00:00:00Z`
              : group.posts[0].data.date,
          ),
        })),
    });
  }

  const category = path.match(/^categories\/([^/]+)\/index\.xml$/)?.[1];
  const tag = path.match(/^tags\/([^/]+)\/index\.xml$/)?.[1];
  if (category)
    posts = posts.filter((post) =>
      post.data.categories.some((value) => taxonomySlug(value) === category),
    );
  if (tag)
    posts = posts.filter((post) =>
      post.data.tags.some((value) => taxonomySlug(value) === tag),
    );
  const title = category
    ? `${category} | ${site.name}`
    : tag
      ? `${tag} | ${site.name}`
      : site.name;
  return rss({
    title,
    description: `Recent content from ${site.name}`,
    site: channelUrl,
    customData: "<language>en-US</language>",
    items: posts.map((post) => {
      const content = feedContent(post);
      return {
        title: post.data.title,
        description: content,
        content,
        link: new URL(post.data.url, context.site).toString(),
        pubDate: feedPublicationDate(post),
      };
    }),
  });
};
