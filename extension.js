const vscode = require('vscode');
const fs = require('fs');
const open = require('./open-files.js');

const cheerio = require('cheerio');
const path = require('path');
/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {

	function getModelObj(modelId) {
		// const json = `${path}/app/data/models/${slideName}.json`;
		return {
			[modelId]: {
				html: `t.${modelId}`
			}
		};
	}
	function getModelForTag(element) {
		let name = element.name;
		let id = element.attribs.id;
		let model = element.attribs.model;



		if (id && name == "co-text") {
			console.log("done");

			return getModelObj(id);
		}
		return {};

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

	const subscriptions = [
		vscode.commands.registerCommand("hrod.open", open.openCobaltFiles),
		vscode.commands.registerCommand("hrod.model", () => {

			const rootPath = vscode.workspace.rootPath;
			const activeDocument = vscode.window.activeTextEditor.document;
			const fileName = open.getFileNameFromPath(activeDocument.fileName);

			if (activeDocument.languageId !== 'html') {
				vscode.window.showInformationMessage('Open the file with the HTML extension');
			} else {
				const tags = getTagsOnSlides(activeDocument);
				let tempModelObj = {};
				tags.forEach(elem => {
					tempModelObj = Object.assign(tempModelObj, getModelForTag(elem))
				});
				let jsonModel = fs.readFileSync(`${rootPath}/app/data/models/${fileName}.json`, 'utf8');
				jsonModel = JSON.parse(jsonModel)
				jsonModel = Object.assign(jsonModel, tempModelObj);
				
				fs.writeFileSync(`${rootPath}/app/data/models/${fileName}.json`, JSON.stringify(jsonModel));
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


