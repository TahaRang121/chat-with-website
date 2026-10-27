require("dotenv").config();
const { extractText } = require("./services/contentExtractor");
const { cleanText } = require("./services/textCleaner");
const { chunkText } = require("./services/chunker");
const { createEmbedding, createEmbeddings } = require("./services/embeddingService");
const { createCollection, storeChunks, resetCollection } = require("./services/vectorDatabase");
const { retrieveRelevantChunks } = require("./services/retrievalService");
const {
  initializeDatabase
} = require("./services/vectorDatabase");
const {
  generateSummary,
  selectRepresentativeChunks
} = require("./services/summaryService");
const {
  saveSummary
} = require("./services/summaryStore");

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Allow server to understand JSON request bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chat with Website API is running!");
});

app.post("/website", async (req, res) => {
  const { url } = req.body;

  if (!url || !url.trim()) {
    return res.status(400).json({
      message: "Website URL is required"
    });
  }

  const normalizedUrl = url.trim();

  try {
    new URL(normalizedUrl);

    const websiteId = uuidv4();

    console.log("Received URL:", normalizedUrl);
    console.log("Website ID:", websiteId);

    const response = await fetch(normalizedUrl);

    if (!response.ok) {
      throw new Error(
        `Unable to access website. Server returned ${response.status}.`
      );
    }

    const html = await response.text();

    console.log("Website fetched successfully!");
    console.log("HTML length:", html.length);

    const text = extractText(html);

    console.log("Text extracted successfully!");
    console.log("Text length:", text.length);

    const cleanedText = cleanText(text);

    if (!cleanedText) {
      return res.status(400).json({
        message: "This website does not contain any useful text to process."
      });
    }

    console.log("Text cleaned successfully!");
    console.log("Cleaned text length:", cleanedText.length);

    const chunks = chunkText(cleanedText);

    if (chunks.length === 0) {
      return res.status(400).json({
        message: "Could not create any usable content chunks from this website."
      });
    }

    console.log("Number of chunks:", chunks.length);

    const embeddings = await createEmbeddings(chunks);

    console.log("Embeddings created:", embeddings.length);
    console.log("Embedding dimensions:", embeddings[0].length);

    await storeChunks(
      chunks,
      embeddings,
      normalizedUrl,
      websiteId
    );

    const representativeChunks = selectRepresentativeChunks(chunks);
    const summaryContext = representativeChunks.join("\n\n");
    let summary = "";
    try {
      summary = await generateSummary(summaryContext);
    } catch (error) {
      console.error("Summary generation failed:", error.message);
      summary =
        "A summary could not be generated right now. You can still ask questions about this website.";
      }
      saveSummary(websiteId, summary);

    res.json({
      message: "Website processed successfully",
      url: normalizedUrl,
      websiteId: websiteId,
      numberOfChunks: chunks.length,
      numberOfEmbeddings: embeddings.length,
      embeddingDimensions: embeddings[0].length,
      summary
    });

  } catch (error) {
    console.error("Website processing Error:", error.message);

    res.status(500).json({
      message: "We couldn't process this website.",
      error: error.message
    });
  }
});

const { generateAnswer } = require("./services/geminiService");

app.post("/ask", async (req, res) => {
  try {
    const { websiteId, question } = req.body;

    if (!websiteId || !websiteId.trim()) {
      return res.status(400).json({
        message: "Please process a website before asking a question."
      });
    }
    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Please enter a question."
      });
    }

    // Retrieve relevant chunks
    const chunks = await retrieveRelevantChunks(
      question,
      websiteId
    );

    if(chunks.length === 0){
      return res.json({
        question,
        answer: "I couldn't find that information on the website.",
        sources: []
      });
    }

    // Create context for Gemini
    const context = chunks
    .map((chunk, index) => {
      return `SOURCE ${index + 1}:\n${chunk.text}`;
    })
    .join("\n\n");

    // Generate answer
    const answer = await generateAnswer(
      question,
      context
    );

    res.json({
      question,
      answer,
      sources: chunks
    });

  } catch (error) {
    console.error("RAG error:", error.message);

    res.status(500).json({
      message: "We couldn't generate an answer right now.",
      error: error.message
    });
  }
});

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
}

startServer();