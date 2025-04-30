const {
  SEO_CONTENT_REPORT_PROMPT,
  SYSTEM_CONTENT_ANALYSIS_PROMPT,
} = require("../prompts/seo-report.prompt");
const { scrapeHTMLContent } = require("../services/htmlScraper.service");
const { fetchPageSpeedData } = require("../services/pagespeed.service");
const { scrapeDynamicSite } = require("../services/scrape.service");
const {
  generateTextReport,
  generateJsonReport,
} = require("../services/seo.service");
const axios = require("axios");

const analyzePageSpeed = async (req, res) => {
  try {
    const { url, category } = req.body;
    console.log("url, category", url, category);
    const data = await fetchPageSpeedData(url, category);

    const cwvFilteredData = {
      score: data.lighthouseResult.categories.performance.score,
      firstContentfulPaint:
        data.lighthouseResult.audits["first-contentful-paint"],
      largestContentfulPaint:
        data.lighthouseResult.audits["largest-contentful-paint"],
      cumulativeLayoutShift:
        data.lighthouseResult.audits["cumulative-layout-shift"],
      totalBlockingTime: data.lighthouseResult.audits["total-blocking-time"],
      speedIndex: data.lighthouseResult.audits["speed-index"],
      timeToInteractive: data.lighthouseResult.audits["interactive"],
    };

    const owvFilteredData = {
      score: data.lighthouseResult.categories.performance.score,
      unusedJavaScript: data.lighthouseResult.audits["unused-javascript"],
      unusedCssRules: data.lighthouseResult.audits["unused-css-rules"],
      renderBlockingResources:
        data.lighthouseResult.audits["render-blocking-resources"],
      usesRelPreconnect: data.lighthouseResult.audits["uses-rel-preconnect"],
      usesTextCompression:
        data.lighthouseResult.audits["uses-text-compression"],
      usesLongCache: data.lighthouseResult.audits["uses-long-cache-ttl"],
      usesOptimizedImages:
        data.lighthouseResult.audits["uses-optimized-images"],
    };

    const cwvReport = await generateTextReport(cwvFilteredData);
    const owvReport = await generateTextReport(owvFilteredData);

    res.status(200).json({
      coreWebVitals: cwvReport,
      resourceEfficiency: owvReport,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Failed to analyze page speed", details: error });
  }
};

const analyzeSEOMetrics = async (req, res) => {
  try {
    const { url, category } = req.body;
    console.log("url, category", url, category);
    const data = await fetchPageSpeedData(url, category);

    const filteredData = {
      score: data.lighthouseResult.categories.seo.score,
      documentTitle: data.lighthouseResult.audits["document-title"],
      metaDescription: data.lighthouseResult.audits["meta-description"],
      linkText: data.lighthouseResult.audits["link-text"],
      robotsTxt: data.lighthouseResult.audits["robots-txt"],
      isCrawlable: data.lighthouseResult.audits["is-crawlable"],
      canonical: data.lighthouseResult.audits["canonical"],
    };

    const seoReport = await generateTextReport(filteredData);

    res.status(200).json(seoReport);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Failed to analyze page speed", details: error });
  }
};

const analyzeContent = async (req, res) => {
  const { url } = req.body;
  console.log("url content", url);

  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const response = await axios.get(url);
    const html = response.data;
    const report = await generateJsonReport(html, SEO_CONTENT_REPORT_PROMPT);
    console.log("analyzeContent report", report);
    return res.json(report);
  } catch (error) {
    console.log("analyzeContent error", error);
    return res.status(500).json({ error: "Failed to fetch HTML" });
  }
};

const getContent = async (req, res) => {
  try {
    const { url } = req.body;

    const content = await scrapeDynamicSite(url);

    const report = await generateJsonReport(
      content,
      SYSTEM_CONTENT_ANALYSIS_PROMPT
    );
    const cleanedReport = report.replace(/```json|```/g, "").trim();

    // Parse the cleaned JSON report
    const parsedReport = JSON.parse(cleanedReport);

    res.status(200).json({ content, report: parsedReport });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

module.exports = {
  analyzePageSpeed,
  analyzeSEOMetrics,
  analyzeContent,
  getContent,
};
