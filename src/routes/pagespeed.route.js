const express = require("express");
const router = express.Router();
const { analyzePageSpeed } = require("../controllers/pagespeed.controller");

router.post("/analyze", analyzePageSpeed);

module.exports = router;
