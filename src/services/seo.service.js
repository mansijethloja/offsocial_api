require("dotenv").config();
const { ChatOpenAI } = require("@langchain/openai");
const { StructuredOutputParser } = require("langchain/output_parsers");
const { z } = require("zod");
const { CWV_REPORT_PROMPT } = require("../prompts/seo-report.prompt");

// Initialize LangChain model
const model = new ChatOpenAI({
  temperature: 0.3,
  modelName: "gpt-4o",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a textual SEO report using LangChain
 * @param {Object} pageSpeedData - JSON data from Google PageSpeed Insights
 * @returns {Promise<string>}
 */
const generateTextReport = async (pageSpeedData) => {
  const prompt = `${CWV_REPORT_PROMPT}
  ${JSON.stringify(pageSpeedData)}`;

  const result = await model.invoke([
    { role: "system", content: "You are an SEO expert." },
    { role: "user", content: prompt },
  ]);

  return result.content;
};

/**
 * Generates a structured JSON report using LangChain + Zod validation
 * @param {Object|string} inputData - HTML string
 * @param {string} promptMessage - The prompt message to be used for report generation
 */
const generateJsonReport = async (inputData, promptMessage) => {
  const formattedPrompt = `Here is the scrapped content:
${JSON.stringify(inputData)}`;

  try {
    const result = await model.invoke([
      {
        role: "system",
        content: promptMessage,
      },
      { role: "user", content: formattedPrompt },
    ]);

    return result.content;
  } catch (error) {
    console.error("LangChain JSON parse error:", error);
    throw new Error("Failed to generate AI JSON report using LangChain.");
  }
};

module.exports = {
  generateTextReport,
  generateJsonReport,
};
