const Joi = require("joi");
const { analyzeBusinessDNA } = require("../services/business-dna.service");

/**
 * Validation schema for business DNA analysis request
 */
const analysisSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    "string.uri": "Please provide a valid URL",
    "any.required": "URL is required",
  }),
  primaryGoal: Joi.string().required().messages({
    "any.required": "Primary goal is required",
  }),
});

/**
 * Validate request body
 * @param {Object} body - Request body to validate
 * @returns {Object} - Validation result
 */
const validateAnalysisRequest = (body) => {
  return analysisSchema.validate(body);
};

/**
 * Handle business DNA analysis request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleAnalyzeBusinessDNA = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = validateAnalysisRequest(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: error.details[0].message,
        statusCode: 400,
      });
    }

    const { url, primaryGoal } = value;

    // Log the analysis request
    console.log(
      `[${new Date().toISOString()}] Starting business DNA analysis for: ${url}`
    );

    // Perform business DNA analysis
    const result = await analyzeBusinessDNA(url, primaryGoal);

    console.log(
      `[${new Date().toISOString()}] Business DNA analysis completed successfully for: ${url}`
    );

    // Return successful response
    return res.status(200).json({
      success: true,
      message: "Business DNA analysis completed successfully",
      data: result.data,
      statusCode: 200,
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Business DNA analysis error:`,
      error.message
    );

    // Determine error type and status code
    let statusCode = 500;
    let errorType = "Server Error";

    if (error.message.includes("Invalid URL")) {
      statusCode = 400;
      errorType = "Validation Error";
    } else if (error.message.includes("API key")) {
      statusCode = 401;
      errorType = "Authentication Error";
    } else if (
      error.message.includes("rate limit") ||
      error.message.includes("429")
    ) {
      statusCode = 429;
      errorType = "Rate Limit Error";
    } else if (
      error.message.includes("503") ||
      error.message.includes("unavailable")
    ) {
      statusCode = 503;
      errorType = "Service Unavailable";
    }

    return res.status(statusCode).json({
      success: false,
      error: errorType,
      message: error.message,
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Handle health check request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleHealthCheck = async (req, res) => {
  try {
    const healthInfo = {
      success: true,
      message: "Business DNA Analysis API is running",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      statusCode: 200,
    };

    return res.status(200).json(healthInfo);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Health check failed",
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Handle API info request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleApiInfo = async (req, res) => {
  try {
    const apiInfo = {
      success: true,
      message: "Business DNA Analysis API Information",
      api: {
        name: "Business DNA Analysis API",
        version: "1.0.0",
        description: "Analyze website business DNA using Perplexity AI",
        endpoints: {
          analyze: {
            method: "POST",
            path: "/api/business-dna/analyze",
            description: "Analyze business DNA for a website URL",
            requestBody: {
              url: "string (required) - Website URL to analyze",
            },
          },
          health: {
            method: "GET",
            path: "/api/business-dna/health",
            description: "API health check endpoint",
          },
          info: {
            method: "GET",
            path: "/api/business-dna/info",
            description: "Get API documentation and usage information",
          },
        },
      },
      usage: {
        authentication: "Set PERPLEXITY_API_KEY environment variable",
        rateLimit: "Subject to Perplexity API rate limits",
        supportedModels: ["sonar-pro"],
        maxResponseTime: "300 seconds",
      },
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(apiInfo);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve API information",
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  handleAnalyzeBusinessDNA,
  handleHealthCheck,
  handleApiInfo,
  validateAnalysisRequest,
};
