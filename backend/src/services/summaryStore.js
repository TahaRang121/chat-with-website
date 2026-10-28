const {
  qdrant,
  SUMMARY_COLLECTION_NAME
} = require("./vectorDatabase");

async function saveSummary(websiteId, summary) {
  await qdrant.upsert(SUMMARY_COLLECTION_NAME, {
    wait: true,

    points: [
      {
        id: websiteId,
        vector: [0],

        payload: {
          websiteId,
          summary
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