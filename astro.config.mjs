// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import partytown from '@astrojs/partytown';
import fs from 'node:fs';
import path from 'node:path';

import dsv from '@rollup/plugin-dsv';

// Helper to get categories at build time
const getCategories = () => {
  try {
    const contentDir = './src/content';
    if (!fs.existsSync(contentDir)) return [];
    return fs.readdirSync(contentDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  } catch (e) {
    return ['novel', 'manga']; // Minimal fallback
  }
};

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/about': '/',
  },
  site: 'https://lazynoman.com',
  output: 'server',
  integrations: [
    mdx(),
    react(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  adapter: cloudflare({
    imageService: 'compile'
  }),
  vite: {
    plugins: [tailwindcss(), dsv()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    ssr: {
      noExternal: ['radix-ui', 'lucide-react'],
    },
    define: {
      'import.meta.env.DYNAMIC_CATEGORIES': JSON.stringify(getCategories()),
    }
  },
});