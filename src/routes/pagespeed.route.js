const express = require("express");
const router = express.Router();
const {
  analyzePageSpeed,
  analyzeSEOMetrics,
  analyzeContent,
  getContent,
} = require("../controllers/pagespeed.controller");

router.post("/performance", analyzePageSpeed);
router.post("/seo", analyzeSEOMetrics);
router.post("/content", analyzeContent);
router.post("/scrapeContent", getContent);

module.exports = router;
