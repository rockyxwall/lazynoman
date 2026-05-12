import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getPostUrl } from '../lib/utils';

export const GET: APIRoute = async (context) => {
  const siteUrl = context.url.origin.endsWith('/') ? context.url.origin : `${context.url.origin}/`;
  
  const urls: string[] = [];

  // 1. Add root
  urls.push(siteUrl);

  // 2. Add category indices
  const categories = ['novel', 'anime', 'manga', 'movie', 'game'];
  categories.forEach((cat) => {
    urls.push(`${siteUrl}${cat}`);
  });

  // 3. Add all markdown posts (excluding drafted)
  const posts = await getCollection('post');
  posts.forEach((post) => {
    if (!post.data.draft) {
      // Use getPostUrl helper (removes leading slash from its output if we want to join with siteUrl)
      const postPath = getPostUrl(post.id).substring(1); 
      urls.push(`${siteUrl}${postPath}`);
    }
  });

  // Remove duplicates just in case
  const uniqueUrls = [...new Set(urls)];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${uniqueUrls.map((url) => `<url><loc>${url}</loc></url>`).join('\n  ')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    },
  });
};
