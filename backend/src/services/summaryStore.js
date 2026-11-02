const { QdrantClient } = require("@qdrant/js-client-rest");

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY
});

const SUMMARY_COLLECTION_NAME = "website_summaries";

async function saveSummary(websiteId, summary) {
  await qdrant.upsert(SUMMARY_COLLECTION_NAME, {
    wait: true,

    points: [
      {
        id: websiteId,

        vector: [1],

        payload: {
          websiteId: websiteId,
          summary: summary
        }
      }
    ]
  });

  console.log("Website summary stored in Qdrant!");
}

async function getSummary(websiteId) {
  const response = await qdrant.retrieve(
    SUMMARY_COLLECTION_NAME,
    {
      ids: [websiteId],
      with_payload: true
    }
  );

  if (!response || response.length === 0) {
    return null;
  }

  return response[0].payload.summary;
}

module.exports = {
  saveSummary,
  getSummary
};