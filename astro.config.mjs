// @ts-check
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import partytown from '@astrojs/partytown';

import dsv from '@rollup/plugin-dsv';

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
  },
});