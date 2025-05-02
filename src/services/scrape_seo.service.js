const path = require("path");

// Import the scrapeSEO function from the script
const { scrapeSEO } = require(path.resolve(
  __dirname,
  "../scripts/scrape_seo.js"
));

module.exports = { scrapeSEO };
