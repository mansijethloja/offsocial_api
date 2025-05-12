const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const urlLib = require("url");
const axios = require("axios");

/**
 * Extracts internal links and analyzes them for SEO purposes.
 * @param {string} baseUrl - The base URL of the website.
 * @returns {Promise<Object>} Internal linking analysis report.
 */
async function analyzeInternalLinks(baseUrl) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: "networkidle2", timeout: 60000 });

  const html = await page.content();
  const $ = cheerio.load(html);
  const baseDomain = new URL(baseUrl).hostname;

  const links = [];
  const seenHrefs = new Set();
  let brokenLinks = 0;
  let redirectChains = 0;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href").trim();
    const anchor = $(el).text().trim() || "[no text]";
    if (!href || seenHrefs.has(href)) return;
    seenHrefs.add(href);

    const absoluteUrl = urlLib.resolve(baseUrl, href);
    const isInternal = new URL(absoluteUrl).hostname === baseDomain;
    if (!isInternal) return;

    links.push({
      href: absoluteUrl,
      anchor,
      anchorType: classifyAnchor(anchor),
      linkPosition: getPosition($(el)),
      nofollow: $(el).attr("rel")?.includes("nofollow") || false,
    });
  });

  // Check for broken links and redirects
  for (const link of links) {
    try {
      const response = await axios.get(link.href, {
        maxRedirects: 10,
        validateStatus: null,
      });
      if (response.status >= 400) brokenLinks++;
      if (
        response.request._redirectable &&
        response.request._redirectable._redirectCount > 1
      ) {
        redirectChains++;
      }
    } catch (error) {
      brokenLinks++;
    }
  }

  await browser.close();

  return {
    pageUrl: baseUrl,
    internalLinks: links,
    metrics: {
      totalInternalLinks: links.length,
      keywordRichAnchors: links.filter((l) => l.anchorType === "keyword-rich")
        .length,
      genericAnchors: links.filter((l) => l.anchorType === "generic").length,
      emptyAnchors: links.filter((l) => l.anchorType === "empty/invalid")
        .length,
      brokenLinks,
      redirectChains,
    },
    score: calculateScore(links, brokenLinks, redirectChains),
  };
}

function classifyAnchor(anchor, domain = "") {
  if (!anchor || anchor.trim().length < 2 || anchor === "[no text]") {
    return "empty/invalid";
  }

  const text = anchor.trim().toLowerCase();

  const genericPhrases = [
    "click here",
    "read more",
    "learn more",
    "this link",
    "more",
    "here",
    "details",
    "visit",
    "go",
    "info",
    "see more",
  ];
  if (genericPhrases.includes(text)) {
    return "generic";
  }

  // Keyword-rich: meaningful phrases (not just a single word or common stopwords)
  const stopwords = [
    "the",
    "a",
    "an",
    "in",
    "on",
    "at",
    "to",
    "is",
    "of",
    "and",
    "for",
    "by",
    "with",
    "as",
  ];
  const tokens = text.split(/\s+/).filter((t) => t && !stopwords.includes(t));
  if (tokens.length >= 2) {
    return "keyword-rich";
  }

  // Brand detection:
  const brandIndicators = [
    "home",
    "about",
    "contact",
    "franchise",
    "privacy policy",
    "terms of use",
  ];
  if (
    brandIndicators.includes(text) ||
    (domain &&
      text.includes(new URL(domain).hostname.replace("www.", "").split(".")[0]))
  ) {
    return "branded";
  }

  // Capitalized CamelCase / TitleCase style anchors (likely branded)
  if (/[A-Z][a-z]+(?:\s?[A-Z][a-z]+)+/.test(anchor)) {
    return "branded";
  }

  return "other";
}

function getPosition(el) {
  const tagPath = el
    .parents()
    .map((_, e) => e.tagName)
    .get()
    .join(" > ")
    .toLowerCase();
  if (tagPath.includes("header")) return "header";
  if (tagPath.includes("footer")) return "footer";
  if (tagPath.includes("nav")) return "nav";
  return "body";
}

function calculateScore(links, brokenLinks, redirectChains) {
  const total = links.length || 1; // Avoid divide-by-zero
  const keywordRich = links.filter(
    (l) => l.anchorType === "keyword-rich"
  ).length;
  const generic = links.filter((l) => l.anchorType === "generic").length;

  const keywordScore = (keywordRich / total) * 100;
  const genericPenalty = (generic / total) * 50;
  const brokenPenalty = (brokenLinks / total) * 100;
  const redirectPenalty = (redirectChains / total) * 60;

  const rawScore =
    keywordScore - genericPenalty - brokenPenalty - redirectPenalty;
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}

module.exports = { analyzeInternalLinks };
