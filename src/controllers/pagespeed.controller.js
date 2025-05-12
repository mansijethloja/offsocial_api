const { CWV_REPORT_PROMPT } = require("../prompts/seo-report.prompt");
const { fetchPageSpeedData } = require("../services/pagespeed.service");
const { generateTextReport } = require("../services/openai.service");

/**
 * Analyzes the performance of a given URL using PageSpeed Insights.
 *
 * @param {Object} req - Express request object. Expects req.body.url and req.body.category as the target URL and category to analyze.
 * @param {Object} res - Express response object.
 *
 * Input:
 *   - req.body.url: {string} The URL of the page to analyze.
 *   - req.body.category: {string} The category of analysis ("core-web-vitals" or "resource-efficiency").
 *
 * Output (JSON response):
 *   - coreWebVitals: {string} Human-readable report for core web vitals.
 *   - resourceEfficiency: {string} Human-readable report for resource efficiency.
 *   - On error: { error: string } with error details.
 */
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

    const cwvReport = await generateTextReport(
      cwvFilteredData,
      CWV_REPORT_PROMPT
    );
    const owvReport = await generateTextReport(
      owvFilteredData,
      CWV_REPORT_PROMPT
    );

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

/**
 * Analyzes the SEO metrics of a given URL using PageSpeed Insights.
 *
 * @param {Object} req - Express request object. Expects req.body.url and req.body.category as the target URL and category to analyze.
 * @param {Object} res - Express response object.
 *
 * Input:
 *   - req.body.url: {string} The URL of the page to analyze.
 *   - req.body.category: {string} The category of analysis ("seo").
 *
 * Output (JSON response):
 *   - seoReport: {string} Human-readable report for SEO metrics.
 *   - On error: { error: string } with error details.
 */
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

    const seoReport = await generateTextReport(filteredData, CWV_REPORT_PROMPT);

    res.status(200).json(seoReport);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Failed to analyze page speed", details: error });
  }
};

module.exports = {
  analyzePageSpeed,
  analyzeSEOMetrics,
};
