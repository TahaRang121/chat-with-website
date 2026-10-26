const { createEmbedding } = require("./embeddingService");

const {
  searchSimilarChunks
} = require("./vectorDatabase");

async function retrieveRelevantChunks(question, websiteId) {
  const questionEmbedding = await createEmbedding(question);

  const results = await searchSimilarChunks(
    questionEmbedding, 
    websiteId, 
    5);

    if(results.length === 0){
      return [];
    }

  const chunks = results.map(result => {
    return {
      text: result.payload.text,
      score: result.score,
      url: result.payload.url,
      chunkIndex: result.payload.chunkIndex
    };
  });

  return chunks;
}

module.exports = {
  retrieveRelevantChunks
};