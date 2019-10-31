const vscode = require('vscode');
const fs = require('fs');
const path = require('path');


function getWorkspace(slideId, settings) {
	return [
		`app/${slideId}.html`,
		`app/styles/${slideId}.css`,
		`app/data/models/${slideId}.json`,
		`app/i18n/${settings.lang}/${slideId}.json`,
		`app/controllers/${slideId}.js`,
	]
}
function getFileNameFromPath(filePath) {
	const fileName = path.parse(filePath)
	return fileName.name;
}

function parseJsData(filename) {
	let json = fs.readFileSync(filename, 'utf8')
		.replace(/\s*\/\/.+/g, '')
		.replace(/,(\s*\})/g, '}')
	return JSON.parse(json);
}

function getPathToPresentation(filePath) {
	const folderName = (process.platform === 'win32') ? "html" : "projects";
	return filePath.split(`${path.sep}${folderName}${path.sep}`).pop();
}

function openFiles(rootPath, slideId, settings) {
	vscode.workspace.findFiles(
		new vscode.RelativePattern(rootPath, `{${getWorkspace(slideId, settings).join(',')}}`)
	)
		.then((TextDocuments) => {
			TextDocuments.forEach(document => {
				vscode.workspace.openTextDocument(document)
					.then((document) => {
						vscode.window.showTextDocument(document, { preview: false });
					});
			});
		});
}

function getChapter(chapters, slide) {
	for (let chapter in chapters) {
		if (chapters[chapter].content.some(element => element == slide)) {
			return chapter;
		}
	}
	vscode.window.showInformationMessage('This slide does not exist in any chapters');
	return undefined;
}
function openUrl(presentationPath, chapter, slide) {
	vscode.env.openExternal(vscode.Uri.parse(`http://localhost/${presentationPath}/#/${chapter}/${slide}`));
}


function openCobaltFiles() {
	const rootPath = vscode.workspace.rootPath;
	const presentationPath = getPathToPresentation(rootPath);
	const structure = parseJsData(`${rootPath}/structure.json`);
	const settings = parseJsData(`${rootPath}/app/settings/app.json`);

	vscode.env.clipboard.readText()
		.then((slideId) => {
			if (Object.keys(structure.slides).some(item => item === slideId)) {
				const chapter = getChapter(structure.chapters, slideId);

				openFiles(rootPath, slideId, settings);
				if (chapter) {
					openUrl(presentationPath, chapter, slideId);
				}
			} else {
				vscode.window.showInformationMessage('Сlipboard is empty!');

				const filePath = vscode.window.activeTextEditor.document.fileName;
				const fileName = getFileNameFromPath(filePath);
				const chapter = getChapter(structure.chapters, fileName);

				openFiles(rootPath, fileName, settings);
				if (chapter) {
					openUrl(presentationPath, chapter, fileName);
				}
			}
		});
}

module.exports = {
	openCobaltFiles,
	getWorkspace,
	getFileNameFromPath,
	parseJsData,
	getPathToPresentation,
	openFiles,
	getChapter,
	openUrl
}