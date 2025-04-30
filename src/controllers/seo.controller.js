const { generateTextReport } = require("../services/seo.service");

const analyzeSEO = async (req, res) => {
  try {
    const { html } = req.body;
    const report = await generateTextReport(html);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { analyzeSEO };
