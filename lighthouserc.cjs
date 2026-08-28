module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run preview -- --host 127.0.0.1",
      startServerReadyPattern: "127.0.0.1:4321",
      url: [
        "http://127.0.0.1:4321/",
        "http://127.0.0.1:4321/comprehension-ability-creating-and-teaching-the-dao-in-various-worlds/",
        "http://127.0.0.1:4321/categories/novel/",
        "http://127.0.0.1:4321/posts/",
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--headless --no-sandbox --disable-dev-shm-usage",
      },
    },
    assert: {
      assertions: {
        "categories:performance": [
          "error",
          { minScore: 0.9, aggregationMethod: "median-run" },
        ],
        "categories:accessibility": [
          "error",
          { minScore: 0.9, aggregationMethod: "median-run" },
        ],
        "categories:best-practices": [
          "error",
          { minScore: 0.9, aggregationMethod: "median-run" },
        ],
        "categories:seo": [
          "error",
          { minScore: 0.9, aggregationMethod: "median-run" },
        ],
        "largest-contentful-paint": [
          "error",
          { maxNumericValue: 3000, aggregationMethod: "median-run" },
        ],
        "cumulative-layout-shift": [
          "error",
          { maxNumericValue: 0.1, aggregationMethod: "median-run" },
        ],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci" },
  },
};
