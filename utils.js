const cheerio = require('cheerio');
const fs = require('fs');

function getTagsOnSlides(document) {
    let file = fs.readFileSync(document.fileName, 'utf8');
    const $ = cheerio.load(file)
    let tags = [];
    $('article').find('*').each((i, elem) => {
        tags.push(elem)
    });
    return tags;
}

function glueObjectWithJSON(targetObj, obj) {
    targetObj = JSON.parse(targetObj)
    targetObj = Object.assign(targetObj, obj);

    return JSON.stringify(targetObj)
}

module.exports = {
    getTagsOnSlides,
    glueObjectWithJSON
}