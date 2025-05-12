const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const {
  generateJsonReport,
  generateBlogTopicSuggestion,
} = require("./openai.service");

/**
 * Scrape and analyze a website for SEO purposes, supporting both static and JS-rendered content.
 * @param {string} url - The website URL to analyze.
 * @returns {Promise<{title: string, meta: Array<{name: string, content: string}>, paragraphs: Array<{heading: string, content: string}>, internalLinks: Array<{href: string, anchor: string}>}>}
 */
async function scrapeContent(url) {
  // Use Puppeteer to render the page
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (compatible; SEOAnalyzer/1.0)");
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  // Wait for root/main content to appear (heuristic, fallback to body)
  await new Promise((res) => setTimeout(res, 3000));
  const html = await page.content();
  const { origin } = new URL(url);

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

  // Extract all h1–h6 headings from the page
  const allHeadings = [];
  ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
    $(tag).each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text) {
        allHeadings.push({ tag, text });
      }
    });
  });

  const internalLinks = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const anchor = $(el).text().replace(/\s+/g, " ").trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;

    try {
      const linkUrl = new URL(href, origin);
      if (linkUrl.origin === origin) {
        internalLinks.push({ href: linkUrl.href, anchor });
      }
    } catch (e) {
      // Skip invalid URLs
      console.log("Invalid URL:", e);
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

  return {
    title,
    allHeadings,
    meta,
    internalLinks,
    paragraphs: dedupedParagraphs,
  };
}

async function generateSuggestionsFromAnalysis(contentArray, prompt) {
  const rawResponse = await generateJsonReport(contentArray, prompt);

  let rawOutput = rawResponse; // Whatever the raw string from the LLM is

  // Remove Markdown-style code block if present
  rawOutput = rawOutput.replace(/```json|```/g, "").trim();

  let parsedSuggestions;
  try {
    parsedSuggestions = JSON.parse(rawOutput);
    return parsedSuggestions;
  } catch (error) {
    console.error("Cleaned Output:", rawOutput);
    throw new Error("Invalid response format from language model");
  }
}

const generateBlogTopicReport = async (headingArray, contentArray, prompt) => {
  const rawResponse = await generateBlogTopicSuggestion(
    headingArray,
    contentArray,
    prompt
  );

  try {
    return rawResponse;
  } catch (error) {
    console.error("Cleaned Output:", rawResponse);
    throw new Error("Invalid response format from language model");
  }
};

module.exports = {
  scrapeContent,
  generateSuggestionsFromAnalysis,
  generateBlogTopicReport,
};
