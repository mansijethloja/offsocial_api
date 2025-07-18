const express = require("express");
const router = express.Router();
const { analyzePageSpeed } = require("../controllers/pagespeed.controller");
const { authenticateJWT } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/pagespeed/lighthouse
 * @desc    Analyze page speed using Google Lighthouse
 * @access  Private
 */
router.post("/lighthouse", authenticateJWT, analyzePageSpeed);

module.exports = router;
