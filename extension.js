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
	function getCoTextI18n(modelId) {
		return {
			[modelId]: ""
		};
	}
	function getCoImageModel(modelId) {
		
	}
	function getModelForTag(element) {
		const name = element.name;
		const id = element.attribs.id;
		let model = element.attribs.model;

		switch (element.name) {
			case "co-text":
				model = model.replace(/(m\.common\.)|(m\.)/g, "");

				const coTextModel = getCoTextModel(model);
				const coTextI18n = getCoTextI18n(model);

				return [coTextModel, coTextI18n];

			case "co-image":
				model = model.replace(/(m\.common\.)|(m\.)/g, "");

				const coImageModel = getCoImageModel(model);

				return [coImageModel, {}];

			default:
				return [Object, Object];
		}


	}



	const subscriptions = [
		vscode.commands.registerCommand("hrod.open", open.openCobaltFiles),
		vscode.commands.registerCommand("hrod.model", () => {

			const activeDocument = vscode.window.activeTextEditor.document;
			const fileName = open.getFileNameFromPath(activeDocument.fileName);

			if (activeDocument.languageId !== 'html') {
				vscode.window.showInformationMessage('Open the file with the HTML extension');
			} else {
				const tags = utils.getTagsOnSlides(activeDocument);
				let tempModelObj = {};
				let tempI18nObj = {};
				// NEED REFACTORIN
				let mergeModelObjects = elem => tempModelObj = R.mergeDeepRight(tempModelObj, getModelForTag(elem)[0]);
				let mergeI18nObjects = elem => tempI18nObj = R.mergeDeepRight(tempI18nObj, getModelForTag(elem)[1]);

				R.forEach(mergeModelObjects, tags);
				R.forEach(mergeI18nObjects, tags);

				let fileModel = fs.readFileSync(`${utils.rootPath}/app/data/models/${fileName}.json`, 'utf8');
				let fileI18n = fs.readFileSync(`${utils.rootPath}/app/data/models/${fileName}.json`, 'utf8');

				let resultModelObj = utils.glueObjectWithJSON(fileModel, tempModelObj);
				let resultI18nObj = utils.glueObjectWithJSON(fileI18n, tempI18nObj);

				fs.writeFileSync(`${utils.rootPath}/app/data/models/${fileName}.json`, resultModelObj);
				fs.writeFileSync(`${utils.rootPath}/app/i18n/${utils.settings.lang}/${fileName}.json`, resultI18nObj);
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


