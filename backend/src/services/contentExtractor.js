const cheerio = require("cheerio");
function extractText(html){
    const $ = cheerio.load(html);
    //remove elements that dontcontain usful page content
    $("script, style, noscript, iframe, header, footer, nav, aside").remove();
    //extract text from remaining html
    const text = $("body").text();
    return text;
}

module.exports ={
    extractText
};