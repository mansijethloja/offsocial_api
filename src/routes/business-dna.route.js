const express = require("express");
const {
  handleAnalyzeBusinessDNA,
} = require("../controllers/business-dna.controller");
const { authenticateJWT } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route   POST /api/business-dna/analyze
 * @desc    Analyze business  zDNA for a website URL
 * @access  Private
 * @body    { url: string }
 * @returns Business DNA analysis in JSON format
 */
router.post("/analyze", authenticateJWT, handleAnalyzeBusinessDNA);

module.exports = router;
