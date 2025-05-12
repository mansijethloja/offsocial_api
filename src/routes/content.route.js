const express = require("express");
const router = express.Router();
const {
  getContent,
  getImprovedContentSuggestions,
  getImprovedHeadingSuggestions,
  getBlogTopicSuggestion,
  handleGenerateBlog,
} = require("../controllers/content.controller");

router.post("/scrapeContent", getContent);
router.post("/generateContent", getImprovedContentSuggestions);
router.post("/generateHeadingSuggestions", getImprovedHeadingSuggestions);
router.post("/generateBlogTopicSuggestion", getBlogTopicSuggestion);
router.post("/generateBlog", handleGenerateBlog);

module.exports = router;
