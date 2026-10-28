const { v4: uuidv4 } = require("uuid");

let QdrantClient;
let qdrant;

const COLLECTION_NAME = "website_chunks";
const SUMMARY_COLLECTION_NAME = "website_summaries";

async function initializeQdrant() {
  const qdrantModule = await import("@qdrant/js-client-rest");

  QdrantClient = qdrantModule.QdrantClient;

  qdrant = new QdrantClient({
    url: "http://localhost:6333"
  });

  console.log("Qdrant client initialized!");
}

async function createCollection() {
  await qdrant.createCollection(COLLECTION_NAME, {
    vectors: {
      size: 384,
      distance: "Cosine"
    }
  });

  console.log("Qdrant collection created!");
}

async function createSummaryCollection() {
  await qdrant.createCollection(
    SUMMARY_COLLECTION_NAME,
    {
      vectors: {
        size: 1,
        distance: "Cosine"
      }
    }
  );

  console.log("Qdrant summary collection created!");
}

async function storeChunks(
  chunks,
  embeddings,
  url,
  websiteId
) {
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

  console.log(
    `${points.length} chunks stored in Qdrant!`
  );
}

async function searchSimilarChunks(
  queryEmbedding,
  websiteId,
  limit = 5
) {
  const response = await qdrant.query(
    COLLECTION_NAME,
    {
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
    }
  );

  console.log("Qdrant response:", response);

  const results = response.points || response;

  console.log("Qdrant results:", results);
  console.log(
    "Is array:",
    Array.isArray(results)
  );

  const filteredResults = results.filter(
    result => result.score >= 0.30
  );

  console.log(
    "Filtered results:",
    filteredResults
  );

  return filteredResults;
}

async function resetCollection() {
  try {
    await qdrant.deleteCollection(
      COLLECTION_NAME
    );

    console.log("Old collection deleted!");
  } catch (error) {
    console.log(
      "Collection did not exist."
    );
  }

  await createCollection();

  console.log(
    "Fresh Qdrant collection created!"
  );
}

async function saveSummary(
  websiteId,
  summary
) {
  await qdrant.upsert(
    SUMMARY_COLLECTION_NAME,
    {
      wait: true,

      points: [
        {
          id: websiteId,

          vector: [0],

          payload: {
            websiteId: websiteId,
            summary: summary
          }
        }
      ]
    }
  );

  console.log(
    "Website summary stored in Qdrant!"
  );
}

async function initializeDatabase() {

  // First initialize Qdrant
  await initializeQdrant();

  // Get existing collections
  const response =
    await qdrant.getCollections();

  // Check main collection
  const exists =
    response.collections.some(
      collection =>
        collection.name ===
        COLLECTION_NAME
    );

  if (!exists) {
    await createCollection();

    console.log(
      "Qdrant collection initialized!"
    );
  } else {
    console.log(
      "Qdrant collection already exists!"
    );
  }

  // Check summary collection
  const summaryExists =
    response.collections.some(
      collection =>
        collection.name ===
        SUMMARY_COLLECTION_NAME
    );

  if (!summaryExists) {
    await createSummaryCollection();
  } else {
    console.log(
      "Qdrant summary collection already exists!"
    );
  }
}

module.exports = {
  getQdrant: () => qdrant,

  COLLECTION_NAME,

  SUMMARY_COLLECTION_NAME,

  createCollection,

  createSummaryCollection,

  storeChunks,

  saveSummary,

  searchSimilarChunks,

  resetCollection,

  initializeDatabase
};