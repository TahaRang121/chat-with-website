function isBroadQuestion(question) {
  const text = question
    .toLowerCase()
    .trim();

  const broadPatterns = [
    "what is this article about",
    "what is this page about",
    "what is this website about",

    "give me a summary",
    "give me the summary",
    "summarize this",
    "summarize the article",
    "summarize the page",
    "can you summarize",
    "please summarize",

    "give me an overview",
    "give me the overview",
    "provide an overview",

    "what are the main points",
    "what are the key points",
    "what are the key takeaways",
    "tell me the main points",
    "tell me the key points",
    "tell me the key takeaways",

    "explain this article",
    "explain this page",
    "explain the whole article",
    "explain the whole page",

    "tell me about this article",
    "tell me about this page",
    "tell me what this article is about",

    "give me the gist",
    "what is the gist",
    "what's the gist",
    "what is this about",
    "what's this about"
  ];

  return broadPatterns.some(pattern =>
    text.includes(pattern)
  );
}

module.exports = {
  isBroadQuestion
};