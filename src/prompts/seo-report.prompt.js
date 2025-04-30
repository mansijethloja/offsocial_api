const CWV_REPORT_PROMPT = `You are a web performance expert. Analyze the JSON data from Google PageSpeed Insights. For each metric, generate a concise, technical, structured, and easy to understand report using the format below. Avoid large fonts.Before each metric add 3 line breaks. Format per metric:
 - Metric Name(must use ## for heading):
    - Description: What it measures and why it matters (short).
    - Score: Value between 0–1.
    - Performance: Actual measured value (e.g., ms or unitless).
    - Findings: Good/bad performance insights.
    - Recommendations: Actionable steps to improve.

Here is the data:
`;

const SEO_CONTENT_REPORT_PROMPT = `You are an SEO expert. Audit the provided HTML for key SEO elements in these categories:
1. Meta elements (title, description, robots, canonical, language, OG tags)
2. Content structure (H1, H2/H3 tags, readability, depth, keywords, CTAs)
3. Media optimization (images, alt attributes, favicon)
4. Technical SEO (schema/structured data, internal links, URL structure)
5. Performance factors (mobile-friendliness, broken links)
Return ONLY a valid JSON object in the following format:
{
  "summary": "<Short summary of findings>",
  "contentInsights": [
    {
      "section": "<SEO element audited>",
      "existingValue": "<Current value found on the page>",
      "recommendation": "<Recommendation for improvement or enhancement>",
      "updatedValue": "<Updated value or optimized content ready to use>",
      "reason": "<justification>"
    }
  ]
}
`;

const CONTENT_ANALYSIS_REPORT_PROMPT = `You are a Content Intelligence SEO Analyst.
Analyze the provided website HTML content for content quality, keyword strategy, readability, and competitive relevance. Use SEO best practices and content marketing principles.Analyze and Report on:
- Content Quality: Evaluate clarity, accuracy, depth, topical relevance, alignment with user intent, tone consistency, and engagement potential.
- Keyword Analysis: Identify primary and secondary keywords, check keyword density, and analyze placement in title, headings, meta, and body content.
- Competitor Keyword Suggestions: Suggest additional keywords likely targeted by similar businesses. Categorize them into:Brand Comparison Keywords, Alternatives Keywords, Feature-Based Keywords, Long-Tail Queries
- Readability Analysis: Calculate readability using:Flesch-Kincaid Grade Level, Flesch Reading Ease Score, Gunning-Fog Index
- Content Strategy Signals: Check content structure, topical coverage, semantic keyword usage, E-E-A-T signals (Experience, Expertise, Authority, Trust), internal linking quality, content freshness, CTA clarity, and any content gaps.
`;


const SYSTEM_CONTENT_ANALYSIS_PROMPT = `Act as SEO expert and do the content analysis based on the content scrapped from the website. Provide a comprehensive SEO audit in JSON with this structure: 
[
  {
    "contentAnalyzed": "<Part being analyzed. Do not modify this>",
    "issues": "<SEO or readability issues>",
    "improvements": "<Actionable suggestions>",
    "reason": "<Why improvement is needed>"
  }
]
Focus on content effectiveness and clarity. Make sure no paragraphs are missed while analysing. Return only the JSON array, without extra explanation.`

module.exports = {
  CWV_REPORT_PROMPT,
  SEO_CONTENT_REPORT_PROMPT,
  CONTENT_ANALYSIS_REPORT_PROMPT,
  SYSTEM_CONTENT_ANALYSIS_PROMPT
};
