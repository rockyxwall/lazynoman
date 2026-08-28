import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://lazynoman.com",
  output: "static",
  outDir: "./dist",
  trailingSlash: "always",
  build: {
    format: "directory",
    inlineStylesheets: "always",
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});
