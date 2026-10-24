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
  const websiteId = uuidv4();
  console.log("Received URL:", url);
  console.log("Website ID:", websiteId);

  try {
    const response = await fetch(url);

    const html = await response.text();

    console.log("Website fetched successfully!");
    console.log("HTML length:", html.length);

    const text = extractText(html);
    console.log("Text extracted successfully!");
    console.log("Text length:", text.length);
    
    const cleanedText = cleanText(text);
    console.log("text cleaned successfully!");
    console.log("Cleaned text length:", cleanedText.length);

    const chunks = chunkText(cleanedText);
    console.log("Number os chunks:", chunks.length);

    const embeddings = await createEmbeddings(chunks);
    console.log("Embeddings created:", embeddings.length);
    console.log("Embedding dimensions:", embeddings[0].length);

    await storeChunks(chunks, embeddings, url, websiteId);

    res.json({
      message: "Website processed successfully",
      url: url,
      websiteId: websiteId,
      numberOfChunks: chunks.length,
      numberOfEmbeddings: embeddings.length,
      embeddingDimensions: embeddings[0].length
    });

  } catch (error) {
    console.error("Error:", error.message);

    res.status(500).json({
      message: "Failed to process website",
      error: error.message
    });
  }
});

const { generateAnswer } = require("./services/geminiService");

app.post("/ask", async (req, res) => {
  try {
    const { websiteId, question } = req.body;

    if (!websiteId || !question) {
      return res.status(400).json({
        message: "websiteId and question are required"
      });
    }

    // Retrieve relevant chunks
    const chunks = await retrieveRelevantChunks(
      question,
      websiteId
    );

    // Create context for Gemini
    const context = chunks
      .map(chunk => chunk.text)
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
      message: "Failed to generate answer",
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