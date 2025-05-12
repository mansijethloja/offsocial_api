const {
  SYSTEM_CONTENT_ANALYSIS_PROMPT,
  DETAILED_CONTENT_ANALYSIS_PROMPT,
  INTERNAL_LINK_REPORT_PROMPT,
  HEADINGS_SUGGESTION_PROMPT,
  HEADINGS_ANALYSIS_PROMPT,
  CONTENT_SUGGESTION_PROMPT,
  BLOG_TOPIC_SUGGESTION_PROMPT,
} = require("../prompts/seo-report.prompt");
const { analyzeInternalLinks } = require("../services/internalLink.service");
const {
  scrapeContent,
  generateSuggestionsFromAnalysis,
  generateBlogTopicReport,
} = require("../services/content.service");
const {
  generateTextReport,
  generateJsonReport,
} = require("../services/openai.service");
const {
  generateContentSuggestionsFromAnalysis,
} = require("../services/content.service");

/**
 * Handles content analysis for a given URL.
 *
 * @param {Object} req - Express request object. Expects req.body.url as the target URL to analyze.
 * @param {Object} res - Express response object.
 *
 * Input:
 *   - req.body.url: {string} The URL of the page to scrape and analyze.
 *
 * Output (JSON response):
 *   - internalLinkReport: {Object} Raw internal link analysis result.
 *   - internalLinkReportJson: {Object} Structured internal link report (parsed JSON).
 *   - report: {Object} Structured content analysis report (parsed JSON).
 *   - textReport: {string} Human-readable content analysis summary.
 *   - On error: { error: string } with error details.
 */
const getContent = async (req, res) => {
  try {
    const { url } = req.body;

    const content = await scrapeContent(url);
    const internalLinkReport = await analyzeInternalLinks(url);

    const internalLinkReportJson = await generateJsonReport(
      internalLinkReport?.internalLinks,
      INTERNAL_LINK_REPORT_PROMPT
    );

    const contentReport = await generateJsonReport(
      content.paragraphs,
      SYSTEM_CONTENT_ANALYSIS_PROMPT
    );

    const textContentReport = await generateTextReport(
      content,
      DETAILED_CONTENT_ANALYSIS_PROMPT
    );

    const textHeadingReport = await generateTextReport(
      content.allHeadings,
      HEADINGS_ANALYSIS_PROMPT
    );

    const cleanedContentReport = contentReport
      .replace(/```json|```/g, "")
      .trim();

    // Parse the cleaned JSON report
    const parsedContentReport = JSON.parse(cleanedContentReport);
    const parsedInternalLinkReportJson = JSON.parse(
      internalLinkReportJson.replace(/```json|```/g, "").trim()
    );

    // res
    //   .status(200)
    //   .json({ content, internalLinkReport, report: parsedReport, textReport });
    res.status(200).json({
      internalLinkReport,
      internalLinkReportJson: parsedInternalLinkReportJson,
      contentReport: {
        tableReport: parsedContentReport,
        textReport: textContentReport,
      },
      headingReport: {
        tableReport: content.allHeadings,
        textReport: textHeadingReport,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

const getImprovedContentSuggestions = async (req, res) => {
  const { analyzedContentArray } = req.body;

  if (!Array.isArray(analyzedContentArray)) {
    return res
      .status(400)
      .json({ error: "Invalid input format. Expecting an array." });
  }

  try {
    const suggestions = await generateSuggestionsFromAnalysis(
      analyzedContentArray,
      CONTENT_SUGGESTION_PROMPT
    );
    res.json(suggestions);
  } catch (error) {
    console.error("Content suggestion generation failed:", error);
    res.status(500).json({ error: "Failed to generate content suggestions" });
  }
};

const getImprovedHeadingSuggestions = async (req, res) => {
  const { analyzedHeadingArray } = req.body;

  if (!Array.isArray(analyzedHeadingArray)) {
    return res
      .status(400)
      .json({ error: "Invalid input format. Expecting an array." });
  }

  try {
    const suggestions = await generateSuggestionsFromAnalysis(
      analyzedHeadingArray,
      HEADINGS_SUGGESTION_PROMPT
    );
    res.json(suggestions);
  } catch (error) {
    console.error("Content suggestion generation failed:", error);
    res.status(500).json({ error: "Failed to generate content suggestions" });
  }
};

const getBlogTopicSuggestion = async (req, res) => {
  const { analyzedHeadingArray, analyzedContentArray } = req.body;

  if (
    !Array.isArray(analyzedHeadingArray) ||
    !Array.isArray(analyzedContentArray)
  ) {
    return res
      .status(400)
      .json({ error: "Invalid input format. Expecting an array." });
  }

  try {
    const suggestions = await generateBlogTopicReport(
      analyzedHeadingArray,
      analyzedContentArray,
      BLOG_TOPIC_SUGGESTION_PROMPT
    );
    res.json(suggestions);
  } catch (error) {
    console.error("Content suggestion generation failed:", error);
    res.status(500).json({ error: "Failed to generate content suggestions" });
  }
};

module.exports = {
  getContent,
  getImprovedContentSuggestions,
  getImprovedHeadingSuggestions,
  getBlogTopicSuggestion,
};
