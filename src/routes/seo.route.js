const express = require("express");
const router = express.Router();
const { analyzeSEO } = require("../controllers/seo.controller");

router.post("/analyze", analyzeSEO);

module.exports = router;
