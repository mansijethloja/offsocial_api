const puppeteer = require("puppeteer");

async function scrapeDynamicSite(url) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const result = await page.evaluate(() => {
    function getHeadingLevel(tagName) {
      return tagName === "H1" ? 1 : tagName === "H2" ? 2 : null;
    }

    const sections = [];
    let currentSection = { heading: "General", content: [] };
    sections.push(currentSection);

    const elements = Array.from(
      document.body.querySelectorAll("h1, h2, p, div")
    );

    for (const el of elements) {
      const tag = el.tagName.toUpperCase();
      const text = el.innerText.trim();

      if (!text) continue;

      if (tag === "H1" || tag === "H2") {
        currentSection = { heading: text, content: [] };
        sections.push(currentSection);
      } else if (tag === "P" || tag === "DIV") {
        currentSection.content.push(text);
      }
    }

    return { sections };
  });

  await browser.close();
  return result;
}

module.exports = { scrapeDynamicSite };
