function cleanText(text) {
  return text
    // Replace multiple spaces/tabs with one space
    .replace(/[ \t]+/g, " ")

    // Reduce 3+ newlines to 2 newlines
    .replace(/\n{3,}/g, "\n\n")

    // Remove spaces at the beginning/end of each line
    .split("\n")
    .map(line => line.trim())
    .join("\n")

    // Remove leading/trailing whitespace
    .trim();
}

module.exports = {
  cleanText
};