const { pipeline } = require("@huggingface/transformers");

let extractor = null;

async function getExtractor() {
  if (!extractor) {
    console.log("Loading embedding model...");

    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    console.log("Embedding model loaded!");
  }

  return extractor;
}

async function createEmbedding(text) {
  const model = await getExtractor();

  const output = await model(text, {
    pooling: "mean",
    normalize: true
  });

  return Array.from(output.data);
}

// Create embeddings for multiple chunks
async function createEmbeddings(chunks) {
  const embeddings = [];

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk);

    embeddings.push(embedding);
  }

  return embeddings;
}

module.exports = {
  createEmbedding,
  createEmbeddings
};