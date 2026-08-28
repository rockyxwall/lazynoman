import rss from "@astrojs/rss";
import type { APIRoute } from "astro";

import {
  feedContent,
  feedPublicationDate,
  getPublishedPosts,
  site,
} from "../lib/content";

export const GET: APIRoute = async (context) => {
  const posts = await getPublishedPosts();
  return rss({
    title: site.name,
    description: site.description,
    site: context.site!,
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
