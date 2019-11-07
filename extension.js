const vscode = require('vscode');
const fs = require('fs');
const open = require('./open-files.js');
const utils = require('./utils');
const cheerio = require('cheerio');
const path = require('path');
const R = require('ramda');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {

	function getCoTextModel(modelId) {
		return {
			[modelId]: {
				html: `t.${modelId}`
			}
		};
	}

	function getModelForTag(element) {
		const name = element.name;
		const id = element.attribs.id;
		let model = element.attribs.model;

		switch (element.name) {
			case "co-text":
				model = model.replace(/(m\.common\.)|(m\.)/g, "");
				return getCoTextModel(model);

			default:
				return {};
		}


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
				const tags = utils.getTagsOnSlides(activeDocument);
				let tempModelObj = {};
				let mergeObjects = elem => tempModelObj = R.mergeDeepRight(tempModelObj, getModelForTag(elem));;
				R.forEach(mergeObjects, tags);
				let fileModel = fs.readFileSync(`${rootPath}/app/data/models/${fileName}.json`, 'utf8');
				let resultObj = utils.glueObjectWithJSON(fileModel, tempModelObj);

				fs.writeFileSync(`${rootPath}/app/data/models/${fileName}.json`, resultObj);
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


