function chunkText(text, chunkSize = 1000, overlap = 200) {
  const paragraphs = text
    .split(/\n+/)
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0);

  const chunks = [];

  let currentChunk = "";

  for (const paragraph of paragraphs) {

    if (
      currentChunk.length + paragraph.length + 1
      <= chunkSize
    ) {
      currentChunk +=
        (currentChunk ? "\n" : "") + paragraph;
    } else {

      if (currentChunk) {
        chunks.push(currentChunk);
      }

      const previousText = currentChunk.slice(-overlap);

      currentChunk =
        previousText +
        (previousText ? "\n" : "") +
        paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

module.exports = {
  chunkText
};