// Lazy initialization of OpenAI client with best practices
exports.getOpenAIClient = () => {
  return new OpenAI({
    temperature: 0.4,
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "gpt-4o",
  });
};
