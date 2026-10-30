import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://lazynoman.com",
  output: "static",
  outDir: "./dist",
  trailingSlash: "always",
  build: {
    format: "directory",
    inlineStylesheets: "always",
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});
