const fetch = require("node-fetch");
const https = require("https");
const http = require("http");
const { URL } = require("url");
const puppeteer = require("puppeteer");
const axios = require("axios");
const cheerio = require("cheerio");

// Node.js function for Business Identity (raw code)
/**
 * Scrape Business Identity from a given website URL
 * @param {string} url - The website URL to scrape
 * @returns {Promise<Object>} - Object containing businessName, websiteUrl, logo, favicon
 */
async function scrapeBusinessIdentity(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Extract logo - try apple-touch-icon, then img alt containing logo
    let logo =
      $('link[rel="apple-touch-icon"]').attr("href") ||
      $('img[alt*="logo"]').attr("src") ||
      null;
    if (logo && !logo.startsWith("http")) {
      logo = new URL(logo, url).href;
    }

    // Extract favicon
    let favicon = $('link[rel="icon"]').attr("href") || null;
    if (favicon && !favicon.startsWith("http")) {
      favicon = new URL(favicon, url).href;
    }

    // Extract business name from meta og:site_name, title, or application-name
    let businessName =
      $('meta[property="og:site_name"]').attr("content") ||
      $("title").text() ||
      $('meta[name="application-name"]').attr("content") ||
      null;

    return {
      businessName,
      logo,
      favicon,
    };
  } catch (error) {
    // Return nulls if any error occurs
    return {
      businessName: null,
      logo: null,
      favicon: null,
    };
  }
}

/**
 * Checks live status, SSL, logo, and favicon (supports all website technologies/frameworks).
 * Returns null for any missing data.
 * @param {string} websiteUrl
 * @returns {Promise<Object>}
 */
async function getWebsiteStatus(websiteUrl) {
  const result = {
    live_status: null,
    ssl_certificate_status: null,
  };

  let urlObj;
  try {
    urlObj = new URL(websiteUrl);
  } catch {
    return result;
  }

  // 1. Check if site is live (HEAD request)
  const protocolModule = urlObj.protocol === "https:" ? https : http;
  const options = {
    method: "HEAD",
    host: urlObj.hostname,
    path: urlObj.pathname || "/",
    port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
    timeout: 8000,
    rejectUnauthorized: false,
  };

  let isLive = false;
  let sslStatus = null;

  await new Promise((resolve) => {
    const req = protocolModule.request(options, (res) => {
      isLive = res.statusCode < 500;
      // SSL check: only for HTTPS
      if (urlObj.protocol === "https:") {
        const cert = res.socket.getPeerCertificate();
        sslStatus =
          cert && cert.valid_to && res.socket.authorized ? "valid" : "invalid";
      } else {
        sslStatus = null;
      }
      resolve();
    });
    req.on("error", () => resolve());
    req.on("timeout", () => {
      req.destroy();
      resolve();
    });
    req.end();
  });

  result.live_status = isLive ? "reachable" : null;
  result.ssl_certificate_status =
    urlObj.protocol === "https:" ? sslStatus || null : null;

  if (!isLive) return result;

  return result;
}
/**
 * Generate business DNA prompt for Perplexity
 * @param {string} url - Website URL to analyze
 * @param {string} primaryGoal - Primary goal for the website
 * @returns {string} - Formatted prompt for business analysis
 */
const generateBusinessDNAPrompt = (url, primaryGoal) => {
  return `Analyze the following website URL and generate a structured detailed digital brand audit using public data (website, social media, ads, SEO, and competitors).

Input:
Website URL: ${url}
Primary Goal: ${primaryGoal}

Instructions:
Use publicly available data to infer the business identity, branding strategy, positioning, and engagement approach. Set any missing/unavailable data to null. Return only a JSON object with the exact structure below.

{
  "business_description": {
    "short_introduction": "<1-2 sentence summary>",
    "long_description": "<About Us summary>",
    "mission_vision": "<Mission or Vision statements>",
    "tagline": "<Tagline or slogan>"
  },
  "brand_evaluation": {
    "core_message": "<Identify core message from content.>",
    "brand_voice": "<Identify how the brand sounds (e.g. bold, playful) from content.>",
    "value_proposition": "<Check if value proposition is clearly communicated.>"
  },
  "products_services": {
    "offerings": [
      {
        "category": "<Category label>",
        "items": ["<Offering 1>", "<Offering 2>", "..."]
      }
    ]
  },
  "target_audience": {
    "primary_segments": ["<Who the website is speaking to (e.g., B2B/B2C, industry, persona types)>"],
    "use_cases": ["<Example use cases>"],
    "industries_served": ["<List of industries served>"]
  },
  "usps": {
    "core_differentiators": [<Core value props or differentiators>],
    "themes": [<Common themes: affordability, innovation, speed, customization, etc.>]
  },
  "tone_of_voice": {
    "sentiment": [<Formal, friendly, tech-savvy, playful, etc.>],
    "style_classification": [<Direct>, <Technical>, ...]
  },
  "competitor_industry_positioning": {
    "inferred_competitors": [
      {
        "brand": "<Competitor Brand Name>",
        "web_presence": "<Website quality/strength>",
        "visual_identity": "<Design strengths>",
        "social_strategy": "<How they use social media>",
        "engagement": "<Level of interaction or follower growth>"
      }
    ],
    "industry_niche": "<Niche (e.g., SaaS CRM tools, eco-cleaning D2C)>",
    "market_positioning": "<Premium, budget, niche, mainstream>"
  },
  "branding_elements": {
    "color_palette": "<Hex codes or names if extractable>",
    "typography": "<Font names or style>",
    "imagery_themes": ["<e.g., lifestyle photography, illustrations>"],
    "consistency_notes": "<Consistency across pages or platforms>"
  },
  "call_to_actions": {
    "primary_ctas": ["<e.g., Book a Demo, Try for Free>"],
    "placement_strategy": ["<e.g., homepage hero, sticky header>"],
    "engagement_flow": "<How CTAs guide the user journey>"
  }
}`;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Make API request to Perplexity
 * @param {string} prompt - The prompt to send to Perplexity
 * @returns {Promise<Object>} - API response
 */
const callPerplexityAPI = async (prompt) => {
  const PERPLEXITY_API_ENDPOINT = "https://api.perplexity.ai/chat/completions";
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY environment variable is not set");
  }

  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      model: "sonar-deep-research",
      messages: [
        {
          role: "system",
          content:
            "You are a professional business analyst specializing in digital marketing and brand analysis. Provide comprehensive, accurate business DNA analysis based on website data. Always return valid JSON format wrapped in a JSON code block.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      // max_tokens: 4000,
      temperature: 0.1,
      top_p: 0.9,
      stream: false,
    }),
  };

  const response = await fetch(PERPLEXITY_API_ENDPOINT, requestOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Perplexity API error: ${response.status} - ${
        errorData.error?.message || response.statusText
      }`
    );
  }

  return await response.json();
};

/**
 * Extract JSON from Perplexity response
 * @param {Object} response - Perplexity API response
 * @returns {Object} - Parsed JSON business DNA
 */
const extractJSONFromResponse = (response) => {
  if (
    !response.choices ||
    !response.choices[0] ||
    !response.choices[0].message
  ) {
    throw new Error("Invalid response format from Perplexity API");
  }

  const content = response.choices[0].message.content;

  // Try to extract JSON from code block first
  const codeBlockMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (error) {
      console.warn(
        "Failed to parse JSON from code block, trying full content extraction"
      );
    }
  }

  // Fallback to finding JSON in the content
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No valid JSON found in the response");
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    throw new Error("Failed to parse JSON from response");
  }
};

/**
 * Analyze business DNA using Perplexity API
 * @param {string} url - Website URL to analyze
 * @returns {Promise<Object>} - Business DNA analysis result
 */
const analyzeBusinessDNA = async (url) => {
  try {
    if (!isValidUrl(url)) {
      throw new Error("Invalid URL format provided");
    }

    console.log(`Starting business DNA analysis for: ${url}`);

    const prompt = generateBusinessDNAPrompt(url);
    const businessIdentity = await scrapeBusinessIdentity(url);
    const websiteStatus = await getWebsiteStatus(url);
    const apiResponse = await callPerplexityAPI(prompt);
    const businessDNA = extractJSONFromResponse(apiResponse);

    console.log(`Business DNA analysis completed for: ${url}`);

    return {
      success: true,
      data: {
        businessDNA,
        businessIdentity: {
          businessName: businessIdentity.businessName,
          websiteUrl: businessIdentity.websiteUrl,
          live_status: websiteStatus.live_status,
          ssl_certificate_status: websiteStatus.ssl_certificate_status,
          logo: businessIdentity.logo,
          favicon: businessIdentity.favicon,
        },
      },
    };
  } catch (error) {
    console.error(`Business DNA analysis failed for ${url}:`, error.message);
    throw new Error(`Business DNA analysis failed: ${error.message}`);
  }
};

module.exports = {
  analyzeBusinessDNA,
  generateBusinessDNAPrompt,
  isValidUrl,
  callPerplexityAPI,
  extractJSONFromResponse,
};
