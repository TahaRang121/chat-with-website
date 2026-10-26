const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateAnswer(question, context) {
  const prompt = `
You are a helpful assistant answering questions about a specific website.

IMPORTANT RULES:
1. Use ONLY the information provided in the CONTEXT.
2. Do NOT use your own general knowledge.
3. Do NOT make up or guess information.
4. If the answer is not clearly present in the CONTEXT, say exactly:
"I couldn't find that information on the website."
5. Answer clearly and concisely.

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