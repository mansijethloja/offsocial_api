const express = require("express");
const { getLeads, enrichLead } = require("../controllers/lead.controller");
const router = express.Router();

router.post("/", getLeads);
router.post("/enrich", enrichLead);

module.exports = router;
