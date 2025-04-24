require("dotenv").config();
const { ChatOpenAI } = require("@langchain/openai");
const { CWV_REPORT_PROMPT } = require("../prompts/seo-report.prompt");

const model = new ChatOpenAI({
  temperature: 0.3,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const generateSEOReport = async (pageSpeedData) => {
  const prompt = `${CWV_REPORT_PROMPT}
  ${JSON.stringify(pageSpeedData)}`;

  const result = await model.call([
    { role: "system", content: "You are an SEO expert." },
    { role: "user", content: prompt },
  ]);

  return result.content;
};

module.exports = { generateSEOReport };
