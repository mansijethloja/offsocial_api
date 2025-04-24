const { fetchPageSpeedData } = require("../services/pagespeed.service");
const { generateSEOReport } = require("../services/seo.service");

const analyzePageSpeed = async (req, res) => {
  try {
    const { url, category } = req.body;
    console.log("url, category", url, category);
    const data = await fetchPageSpeedData(url, category);

    const filteredData = {
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

    const seoReport = await generateSEOReport(filteredData);
    res.status(200).json(seoReport);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

module.exports = { analyzePageSpeed };
