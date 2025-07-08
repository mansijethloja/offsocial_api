/**
 * Business DNA Analysis Routes (Functional Implementation)
 * Defines API routes for business DNA analysis
 */

const express = require("express");
const {
  handleAnalyzeBusinessDNA,
  handleHealthCheck,
  handleApiInfo,
} = require("../controllers/business-dna.controller");

const router = express.Router();

/**
 * @route   POST /api/business-dna/analyze
 * @desc    Analyze business  zDNA for a website URL
 * @access  Public
 * @body    { url: string }
 * @returns Business DNA analysis in JSON format
 */
router.post("/analyze", handleAnalyzeBusinessDNA);

/**
 * @route   GET /api/business-dna/health
 * @desc    API health check endpoint
 * @access  Public
 * @returns API status and health information
 */
router.get("/health", handleHealthCheck);

/**
 * @route   GET /api/business-dna/info
 * @desc    Get API documentation and usage information
 * @access  Public
 * @returns API documentation and endpoint information
 */
router.get("/info", handleApiInfo);

module.exports = router;
