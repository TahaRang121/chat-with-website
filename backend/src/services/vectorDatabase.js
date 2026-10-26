const { QdrantClient } = require("@qdrant/js-client-rest");
const { v4: uuidv4 } = require("uuid");

const qdrant = new QdrantClient({
  url: "http://localhost:6333"
});

const COLLECTION_NAME = "website_chunks";

async function createCollection() {
  await qdrant.createCollection(COLLECTION_NAME, {
    vectors: {
      size: 384,
      distance: "Cosine"
    }
  });

  console.log("Qdrant collection created!");
}

async function storeChunks(chunks, embeddings, url, websiteId) {
  const points = chunks.map((chunk, index) => {
    return {
      id: uuidv4(),

      vector: embeddings[index],

      payload: {
        websiteId: websiteId,
        url: url,
        chunkIndex: index,
        text: chunk
      }
    };
  });

  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points: points
  });

  console.log(`${points.length} chunks stored in Qdrant!`);
}

async function searchSimilarChunks(
  queryEmbedding,
  websiteId,
  limit = 5
) {
  const response = await qdrant.query(COLLECTION_NAME, {
    query: queryEmbedding,

    limit: limit,

    filter: {
      must: [
        {
          key: "websiteId",
          match: {
            value: websiteId
          }
        }
      ]
    },

    with_payload: true
  });

  console.log("Qdrant response:", response);

  const results = response.points || response;

  console.log("Qdrant results:", results);
  console.log("Is array:", Array.isArray(results));

  const filteredResults = results.filter(
    result => result.score >= 0.30
  );

  console.log("Filtered results:", filteredResults);

  return filteredResults;
}

async function resetCollection() {
  try {
    await qdrant.deleteCollection(COLLECTION_NAME);
    console.log("Old collection deleted!");
  } catch (error) {
    console.log("Collection did not exist.");
  }

  await createCollection();

  console.log("Fresh Qdrant collection created!");
}

async function initializeDatabase() {
  const response = await qdrant.getCollections();

  const exists = response.collections.some(
    collection => collection.name === COLLECTION_NAME
  );

  if (!exists) {
    await createCollection();
    console.log("Qdrant collection initialized!");
  } else {
    console.log("Qdrant collection already exists!");
  }
}

module.exports = {
  qdrant,
  COLLECTION_NAME,
  createCollection,
  storeChunks,
  searchSimilarChunks,
  resetCollection,
  initializeDatabase
};