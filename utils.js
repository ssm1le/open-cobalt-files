const cheerio = require('cheerio');
const fs = require('fs');
const R = require('ramda');

function getTagsOnSlides(document) {
    let file = fs.readFileSync(document.fileName, 'utf8');
    const $ = cheerio.load(file)
    let tags = [];
    
    $('article').find('*').each((i, elem) => {
        tags = R.append(elem, tags)
    })
    const isCoComponents = elem => elem.attribs.model && !elem.attribs.model.startsWith('m.common') && elem.name.startsWith('co-');

    return R.filter(isCoComponents, tags);
}

function glueObjectWithJSON(targetObj, obj) {
    targetObj = JSON.parse(targetObj);
    targetObj = R.mergeDeepRight(targetObj, obj);
    return JSON.stringify(targetObj);
}

module.exports = {
    getTagsOnSlides,
    glueObjectWithJSON
}