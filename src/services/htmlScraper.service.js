const { spawn } = require('child_process');
const path = require('path');

function scrapeHTMLContent(url) {
    return new Promise((resolve, reject) => {
        const pythonPath = `C:\\Users\\Mansi\\AppData\\Local\\Programs\\Python\\Python313\\python.exe`;
        const scriptPath = path.resolve(__dirname, '../scripts/scrape_content.py');
        const process = spawn(pythonPath, [scriptPath, url]);

        let result = '';
        process.stdout.on('data', (data) => {
            result += data.toString();
        });

        process.stderr.on('data', (err) => {
            console.error('stderr:', err.toString());
        });

        process.on('close', (code) => {
            try {
                const parsed = JSON.parse(result);
                if (parsed.error) {
                    reject(parsed.error);
                } else {
                    resolve(parsed.content);
                }
            } catch (err) {
                reject('Failed to parse Python response');
            }
        });

        process.on('error', (err) => {
            reject(`Failed to start Python process: ${err.message}`);
        });
    });
}

module.exports = { scrapeHTMLContent };
