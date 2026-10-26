const cheerio = require("cheerio");
function extractText(html) {
  const $ = cheerio.load(html);

  // Remove elements that usually do not contain useful article content
  $(
    "script, style, nav, footer, header, noscript, " +
    "aside, form, iframe, svg"
  ).remove();

  // Prefer the main article/content area when available
  const mainContent =
    $("main").text() ||
    $("article").text() ||
    $("#mw-content-text").text() ||
    $(".mw-parser-output").text() ||
    $("body").text();

  return mainContent;
}

module.exports = {
  extractText
};