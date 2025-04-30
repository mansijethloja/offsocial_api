import sys
import json
import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

# def scrape_content(url):
#     headers = {
#         "User-Agent": (
#             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
#             "AppleWebKit/537.36 (KHTML, like Gecko) "
#             "Chrome/123.0.0.0 Safari/537.36"
#         )
#     }

#     try:
#         response = requests.get(url, headers=headers, timeout=100)
#         response.raise_for_status()

#         soup = BeautifulSoup(response.text, 'html.parser')

#         # Extract relevant content
#         title = soup.title.string.strip() if soup.title else ""
#         description = soup.find('meta', attrs={"name": "description"})
#         description_content = description["content"].strip() if description else ""

#         paragraphs = [p.get_text(strip=True) for p in soup.find_all('p') if p.get_text(strip=True)]
#         headings = [h.get_text(strip=True) for h in soup.find_all(['h1', 'h2', 'h3'])]

#         return {
#             "content": {
#                 "title": title,
#                 "description": description_content,
#                 "headings": headings,
#                 "paragraphs": paragraphs
#             }
#         }

#     except Exception as e:
#         return {"error": str(e)}

# if __name__ == "__main__":
#     if len(sys.argv) != 2:
#         print(json.dumps({"error": "URL argument is required"}))
#         sys.exit(1)

#     url = sys.argv[1]
#     result = scrape_content(url)
#     print(json.dumps(result, ensure_ascii=False))

def scrape_dynamic(url):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url, timeout=60000)
        
        title = page.title()
        description = page.locator('meta[name="description"]').get_attribute('content') or ""
        headings = page.locator('h1, h2, h3').all_inner_texts()
        paragraphs = page.locator('p').all_inner_texts()

        browser.close()

        return {
            "content": {
                "title": title,
                "description": description,
                "headings": headings,
                "paragraphs": [p.strip() for p in paragraphs if p.strip()]
            }
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "URL argument is required"}))
        sys.exit(1)

    url = sys.argv[1]
    try:
        result = scrape_dynamic(url)
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
