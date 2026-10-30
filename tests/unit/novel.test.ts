import { describe, expect, it } from "vitest";
import { getNovelData } from "../../src/lib/novel";
import {
  extractSlugFromUrl,
  parseMarkdownTable,
  parseNovelUpdatesHtml,
} from "../../scripts/crawl-novel.mjs";

describe("Novel Data Loader", () => {
  it("loads fantasy-simulator novel data correctly", () => {
    const novel = getNovelData("fantasy-simulator");
    expect(novel).not.toBeNull();
    expect(novel?.title).toBe("Fantasy Simulator");
    expect(novel?.author).toBe("Salted Fish Jienan (咸鱼洁南)");
    expect(novel?.type).toBe("Web Novel (CN)");
    expect(novel?.year).toBe(2021);
    expect(novel?.rating?.score).toBe(3.6);
    expect(novel?.genres).toContain("Fantasy");
    expect(novel?.tags?.length).toBeGreaterThan(10);
  });

  it("returns null for nonexistent novel slug", () => {
    const novel = getNovelData("non-existent-slug-xyz");
    expect(novel).toBeNull();
  });
});

describe("Crawler Functions", () => {
  it("extracts slug from various novel URLs", () => {
    expect(
      extractSlugFromUrl(
        "https://www.novelupdates.com/series/fantasy-simulator/",
      ),
    ).toBe("fantasy-simulator");
    expect(
      extractSlugFromUrl(
        "https://www.novelupdates.com/series/the-strongest-system",
      ),
    ).toBe("the-strongest-system");
    expect(
      extractSlugFromUrl(
        "https://www.royalroad.com/fiction/21220/mother-of-learning",
      ),
    ).toBe("mother-of-learning");
  });

  it("parses markdown table correctly", () => {
    const sampleTable = `
| Feature | Details |
|---|---|
| **Title** | Test Novel |
| **Author** | Great Author |
| **Year** | 2024 |
| **Status in COO** | Completed |
| **NovelUpdates Rating** | 4.5 / 5.0 (200 votes) |
| **Genre** | Fantasy, Action |
| **Tags** | Magic, OP MC |
| **Description** | A wonderful adventure story. |
`;
    const parsed = parseMarkdownTable(sampleTable);
    expect(parsed.title).toBe("Test Novel");
    expect(parsed.author).toBe("Great Author");
    expect(parsed.year).toBe(2024);
    expect(parsed.statusInCoo).toBe("Completed");
    expect(parsed.rating?.score).toBe(4.5);
    expect(parsed.rating?.votes).toBe(200);
    expect(parsed.genres).toEqual(["Fantasy", "Action"]);
    expect(parsed.tags).toEqual(["Magic", "OP MC"]);
    expect(parsed.description).toBe("A wonderful adventure story.");
  });

  it("parses NovelUpdates HTML snippet correctly", () => {
    const sampleHtml = `
<div class="seriestitlenou">HTML Test Novel</div>
<div id="showauthors"><a href="#">HTML Author</a></div>
<div id="showtype"><a href="#">Web Novel (CN)</a></div>
<div id="showlang"><a href="#">Chinese</a></div>
<div id="edityear">2023</div>
<div id="editstatus">Completed</div>
<div id="seriesgenre"><a href="#">Action</a><a href="#">Adventure</a></div>
<div id="showtags"><a href="#">Cultivation</a></div>
<div id="editdescription">This is a test description.</div>
<span class="my_rating">4.2</span> (150 votes)
`;
    const parsed = parseNovelUpdatesHtml(sampleHtml, "https://example.com");
    expect(parsed.title).toBe("HTML Test Novel");
    expect(parsed.author).toBe("HTML Author");
    expect(parsed.type).toBe("Web Novel (CN)");
    expect(parsed.year).toBe(2023);
    expect(parsed.genres).toEqual(["Action", "Adventure"]);
    expect(parsed.tags).toEqual(["Cultivation"]);
    expect(parsed.rating?.score).toBe(4.2);
    expect(parsed.rating?.votes).toBe(150);
  });
});
