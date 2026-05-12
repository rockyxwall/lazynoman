import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getAllNovels } from '../lib/parseNovels';

export const GET: APIRoute = async (context) => {
  const db = context.locals.db;
  const siteUrl = new URL(context.url.origin);
  
  const urls: string[] = [];

  // 1. Add root
  urls.push(siteUrl.href);

  // 2. Add static category indices
  const categories = ['novel', 'anime', 'manga', 'movie', 'game'];
  categories.forEach((cat) => {
    urls.push(`${siteUrl.href}${cat}/`);
  });

  // 3. Add all markdown posts (excluding drafted)
  const posts = await getCollection('post');
  posts.forEach((post) => {
    if (!post.data.draft) {
      const slug = (post.id.split('/').pop()?.replace(/\.[^/.]+$/, "") || "");
      urls.push(`${siteUrl.href}${slug}`);
    }
  });

  // Remove duplicates just in case
  const uniqueUrls = [...new Set(urls)];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${uniqueUrls.map((url) => `<url><loc>${url}</loc></url>`).join('\n  ')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    },
  });
};
