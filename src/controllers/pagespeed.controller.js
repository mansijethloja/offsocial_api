const { CWV_REPORT_PROMPT } = require("../prompts/seo-report.prompt");
const { fetchPageSpeedData } = require("../services/pagespeed.service");
const { generateTextReport } = require("../services/openai.service");
const transformPageSpeedData = require("../utils/transformData");

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
    const { url, category, strategy } = req.body;
    console.log("url, category, strategy", url, category, strategy);
    const data = await fetchPageSpeedData(url, category, strategy);

    let performanceReportJson;
    if (category === "PERFORMANCE") {
      performanceReportJson = transformPageSpeedData(data);
    }

    // if (category === "SEO") {
    //   performanceReportJson = transformLighthouseCategory(
    //     data.lighthouseResult,
    //     "seo"
    //   );
    // }

    // if (category === "BEST_PRACTICES") {
    //   performanceReportJson = transformLighthouseCategory(
    //     data.lighthouseResult,
    //     "best-practices"
    //   );
    // }

    // if (category === "ACCESSIBILITY") {
    //   performanceReportJson = transformLighthouseCategory(
    //     data.lighthouseResult,
    //     "accessibility"
    //   );
    // }

    res.status(200).json({ performanceReportJson });
  } catch (error) {
    console.log(error);
    console.log(error.status);
    res
      .status(500)
      .json({ error: "Failed to analyze page speed", details: error });
  }
};

module.exports = {
  analyzePageSpeed,
};
