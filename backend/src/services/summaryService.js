const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateSummary(context) {
  const prompt = `
  You are creating a high-quality overview of a website or article.
  
  Use ONLY the information provided in the CONTEXT.
  
  Create a concise but informative summary.
  
  Your response should contain:
  
  1. A short introduction explaining what the article is mainly about.
  2. The major topics or sections discussed.
  3. The most important concepts, ideas, or facts.
  4. A short concluding statement explaining the overall purpose or message.
  
  Rules:
  - Use only the provided context.
  - Do not use outside knowledge.
  - Do not invent information.
  - Do not mention that you were given context.
  - Do not say "according to the context".
  - Keep the answer easy to understand.
  - Avoid unnecessary repetition.
  - Use short paragraphs and bullet points where useful.

CONTEXT:
${context}

SUMMARY:
`;

  let response;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt
      });

      break;
    } catch (error) {
      console.log(
        `Summary generation attempt ${attempt} failed.`
      );

      if (attempt === 3) {
        throw error;
      }

      await new Promise(resolve => {
        setTimeout(resolve, 2000);
      });
    }
  }

  return response.text;
}

function selectRepresentativeChunks(chunks, maxChunks = 12) {
  if (chunks.length <= maxChunks) {
    return chunks;
  }

  const selected = [];

  // First few chunks
  selected.push(...chunks.slice(0, 4));

  const remainingSlots = maxChunks - selected.length;

  const step = Math.floor(
    (chunks.length - 4) / remainingSlots
  );

  for (
    let i = 4;
    i < chunks.length && selected.length < maxChunks;
    i += step
  ) {
    selected.push(chunks[i]);
  }

  return selected;
}

module.exports = {
  generateSummary,
  selectRepresentativeChunks
};