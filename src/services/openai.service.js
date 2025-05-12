require("dotenv").config();
const { ChatOpenAI } = require("@langchain/openai");

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
const generateTextReport = async (pageSpeedData, promptMessage) => {
  const prompt = `${promptMessage}
  ${JSON.stringify(pageSpeedData)}`;

  const result = await model.invoke([
    { role: "system", content: "You are an SEO expert." },
    { role: "user", content: prompt },
  ]);

  return result.content;
};

/**
 * Generates a textual Blog topic report using LangChain
 * @param {Object} content1 - JSON data from Google PageSpeed Insights
 * @returns {Promise<string>}
 */
const generateBlogTopicSuggestion = async (
  content1,
  content2,
  promptMessage
) => {
  const prompt = `${promptMessage}
  ${JSON.stringify(content1)}
  ${JSON.stringify(content2)}`;

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
  generateBlogTopicSuggestion,
  generateJsonReport,
};
