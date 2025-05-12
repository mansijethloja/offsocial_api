const express = require("express");
const router = express.Router();
const {
  analyzePageSpeed,
  analyzeSEOMetrics,
} = require("../controllers/pagespeed.controller");

router.post("/performance", analyzePageSpeed);
router.post("/seo", analyzeSEOMetrics);

module.exports = router;
