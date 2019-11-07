const vscode = require('vscode');
const cheerio = require('cheerio');
const fs = require('fs');
const R = require('ramda');
const rootPath = vscode.workspace.rootPath;
const settings = parseJsData(`${rootPath}/app/settings/app.json`);

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
function parseJsData(filename) {
	let json = fs.readFileSync(filename, 'utf8')
		.replace(/\s*\/\/.+/g, '')
		.replace(/,(\s*\})/g, '}')
	return JSON.parse(json);
}
function glueObjectWithJSON(targetObj, obj) {
    targetObj = JSON.parse(targetObj);
    targetObj = R.mergeDeepRight(targetObj, obj);
    return JSON.stringify(targetObj);
}

module.exports = {
    getTagsOnSlides,
    settings,
    parseJsData,
    rootPath,
    glueObjectWithJSON
}