const { fetchPageSpeedData } = require("../services/pagespeed.service");
const {
  transformPerformanceData,
  transformSeoData,
  transformBestPracticesData,
  transformAccessibilityData,
} = require("../utils/transformData");

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
      performanceReportJson = transformPerformanceData(data);
    }

    if (category === "SEO") {
      performanceReportJson = transformSeoData(data);
    }

    if (category === "BEST_PRACTICES") {
      performanceReportJson = transformBestPracticesData(data);
    }

    if (category === "ACCESSIBILITY") {
      performanceReportJson = transformAccessibilityData(data);
    }

    res.status(200).json({ performanceReportJson });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Failed to analyze page speed", details: error });
  }
};

module.exports = {
  analyzePageSpeed,
};
