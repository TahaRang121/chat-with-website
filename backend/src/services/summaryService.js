const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateSummary(context) {
  const prompt = `
You are creating a concise overview of a website or article.

Use ONLY the information provided in the context.

Create a clear summary that explains:
- What the website or article is mainly about
- Its main topics or ideas
- Important concepts discussed

Do not add information that is not present in the context.
Do not make assumptions.

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