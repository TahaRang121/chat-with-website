const summaries = new Map();

function saveSummary(websiteId, summary) {
  summaries.set(websiteId, summary);
}

function getSummary(websiteId) {
  return summaries.get(websiteId);
}

module.exports = {
  saveSummary,
  getSummary
};