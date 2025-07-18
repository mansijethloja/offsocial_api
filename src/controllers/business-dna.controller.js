const Joi = require("joi");
const { analyzeBusinessDNA } = require("../services/business-dna.service");
const { createBusinessDNA } = require("../services/business-dna-db.service");

/**
 * Validation schema for business DNA analysis request
 */
const analysisSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    "string.uri": "Please provide a valid URL",
    "any.required": "URL is required",
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
 */
const handleAnalyzeBusinessDNA = async (req, res) => {
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

    const { url } = value;

    // Log the analysis request
    console.log(
      `[${new Date().toISOString()}] Starting business DNA analysis for: ${url}`
    );

    // Perform business DNA analysis
    const result = await analyzeBusinessDNA(url);

    console.log(
      `[${new Date().toISOString()}] Business DNA analysis completed successfully for: ${url}`
    );

    // Store the analysis result in the database
    try {
      const storedData = await createBusinessDNA(result.data, url);
      console.log(
        `[${new Date().toISOString()}] Business DNA stored in database with ID: ${
          storedData._id
        }`
      );
    } catch (dbError) {
      console.error(
        `[${new Date().toISOString()}] Error storing business DNA in database:`,
        dbError.message
      );
    }

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

module.exports = {
  handleAnalyzeBusinessDNA,
  validateAnalysisRequest,
};
