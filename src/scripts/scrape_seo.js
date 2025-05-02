const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

/**
 * Scrape and analyze a website for SEO purposes, supporting both static and JS-rendered content.
 * @param {string} url - The website URL to analyze.
 * @returns {Promise<{title: string, meta: Array<{name: string, content: string}>, paragraphs: Array<{heading: string, content: string}>}>}
 */
async function scrapeSEO(url) {
  // Use Puppeteer to render the page
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (compatible; SEOAnalyzer/1.0)");
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  // Wait for root/main content to appear (heuristic, fallback to body)
  await new Promise(res => setTimeout(res, 3000));
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);

  // Remove all style, script, noscript, svg, template, header, footer, nav, and aside tags
  $(
    "style, script, noscript, svg, template, header, footer, nav, aside"
  ).remove();

  // Extract title
  const title = $("head > title").text().trim();

  // Extract meta tags
  const meta = [];
  $("head meta").each((_, el) => {
    const name = $(el).attr("name") || $(el).attr("property") || "";
    const content = $(el).attr("content") || "";
    if (name && content) {
      meta.push({ name, content });
    }
  });

  // Use <main> if present, else <body>
  let $contentRoot = $("main");
  if ($contentRoot.length === 0) $contentRoot = $("body");

  // Recursive function to traverse DOM in document order
  function extractParagraphsWithHeadings(el, currentHeading, outArr) {
    $(el)
      .children()
      .each((_, child) => {
        const tag = $(child).prop("tagName")?.toLowerCase();
        if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
          currentHeading = $(child).text().replace(/\s+/g, " ").trim();
        } else if (tag === "p") {
          let text = $(child).text().replace(/\s+/g, " ").trim();
          if (text.length >= 20 && /[a-zA-Z]/.test(text)) {
            outArr.push({ heading: currentHeading || "", content: text });
          }
        }
        // Recursively process children (for nested sections, divs, etc.)
        extractParagraphsWithHeadings(child, currentHeading, outArr);
      });
  }

  const paragraphs = [];
  extractParagraphsWithHeadings($contentRoot, "", paragraphs);

  // Deduplicate paragraphs by content
  const seen = new Set();
  const dedupedParagraphs = paragraphs.filter((p) => {
    if (seen.has(p.content)) return false;
    seen.add(p.content);
    return true;
  });

  return { title, meta, paragraphs: dedupedParagraphs };
}

module.exports = { scrapeSEO };
