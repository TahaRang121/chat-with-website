const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateAnswer(question, context) {
  const prompt = `
You are a helpful assistant answering questions about a website.

Use ONLY the information provided in the context below.

If the answer is not present in the context, say:
"I couldn't find that information on the website."

Context:
${context}

Question:
${question}

Answer clearly and concisely.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt
  });

  return response.text;
}

module.exports = {
  generateAnswer
};