const express = require("express");
const router = express.Router();
const {
  getContent,
  getImprovedContentSuggestions,
  getImprovedHeadingSuggestions,
  getBlogTopicSuggestion,
  handleGenerateBlog,
} = require("../controllers/content.controller");
const { authenticateJWT } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/content/scrapeContent
 * @desc    Scrape content from a URL
 * @access  Private
 */
router.post("/scrapeContent", authenticateJWT, getContent);

/**
 * @route   POST /api/content/generateContent
 * @desc    Generate improved content suggestions
 * @access  Private
 */
router.post("/generateContent", authenticateJWT, getImprovedContentSuggestions);

/**
 * @route   POST /api/content/generateHeadingSuggestions
 * @desc    Generate improved heading suggestions
 * @access  Private
 */
router.post("/generateHeadingSuggestions", authenticateJWT, getImprovedHeadingSuggestions);

/**
 * @route   POST /api/content/generateBlogTopicSuggestion
 * @desc    Generate blog topic suggestions
 * @access  Private
 */
router.post("/generateBlogTopicSuggestion", authenticateJWT, getBlogTopicSuggestion);

/**
 * @route   POST /api/content/generateBlog
 * @desc    Generate complete blog
 * @access  Private
 */
router.post("/generateBlog", authenticateJWT, handleGenerateBlog);

module.exports = router;
