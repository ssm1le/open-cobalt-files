const vscode = require('vscode');
const fs = require('fs');
const open = require('./open-files.js');
// const html = require('./html.js');

const cheerio = require('cheerio');

/**
 * @param {vscode.ExtensionContext} context
 **/

function writeModel(modelId, path, slideName) {
	const json = `${path}/app/data/models/${slideName}.json`;
	const results = {
		${modelId}: {
			"html": t.${modelId}
		}
	}
	fs.writeFileSync(json, "Привет ми ми ми!");
}
function someFunc(element,slideName) {
	const rootPath = vscode.workspace.rootPath;
	let model = element.attribs.model;
	let name = element.name;
let id = element.attribs.idl;
	if(name==="co-text"){
		writeModel(id,rootPath,slideName);
	}

}
function getTagsOnSlides(document) {
	let file = fs.readFileSync(document.fileName, 'utf8');
	const $ = cheerio.load(file)
	let tags = [];
	$('article').find('*').each((i, elem) => {
		tags.push(elem)
	});
	return tags;
}
function activate(context) {

	const subscriptions = [
		vscode.commands.registerCommand("hrod.open", open.openCobaltFiles),
		vscode.commands.registerCommand("hrod.model", () => {
			
			const activeDocument = vscode.window.activeTextEditor.document;
			const fileName = open.getFileNameFromPath(activeDocument.fileName);

			if (activeDocument.languageId !== 'html') {
				vscode.window.showInformationMessage('Open the file with the HTML extension');
			} else {
				const tags = getTagsOnSlides(activeDocument);
				tags.forEach(elem => {
					someFunc(elem,fileName);
				});
			}
		}),
		vscode.commands.registerCommand("hrod.fix", () => { })
	];

	subscriptions.forEach(sub => context.subscriptions.push(sub));
}
exports.activate = activate;

function deactivate() { }

module.exports = {
	activate,
	deactivate
}


