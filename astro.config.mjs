import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import partytown from '@astrojs/partytown';

export default defineConfig({
  site: 'https://lazynoman.com',
  output: 'static',
  integrations: [
    sitemap(),
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
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    ssr: {
      noExternal: ['radix-ui', 'lucide-react'],
    },
  },
});
