const puppeteer = require('puppeteer');

const scrapeDynamicSite = async (url) => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    );
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const data = await page.evaluate(() => {
        const title = document.title;
        const description = document.querySelector('meta[name="description"]')?.content || '';
        const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim());
        const paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.innerText.trim()).filter(Boolean);

        return {
            title,
            description,
            headings,
            paragraphs
        };
    });

    await browser.close();
    return { content: data };
}

module.exports = { scrapeDynamicSite };
