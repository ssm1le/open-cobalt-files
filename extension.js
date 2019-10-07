const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const ignoreWorkspace = [
	'app/data/kpi/*',
	'app/media/**',
];

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

function openFiles(rootPath, slideId) {
	vscode.workspace.findFiles(
		new vscode.RelativePattern(rootPath, `{app/**/${slideId}.*}`),
		new vscode.RelativePattern(rootPath, `{${ignoreWorkspace.join(',')}}`),
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

/**
 * @param {vscode.ExtensionContext} context
 **/

function activate(context) {

	let disposable = vscode.commands.registerCommand('hrod.open', function () {
		const rootPath = vscode.workspace.rootPath;
		const presentationPath = getPathToPresentation(rootPath);
		const structure = parseJsData(`${rootPath}/structure.json`);

		vscode.env.clipboard.readText()
			.then((slideId) => {
				if (Object.keys(structure.slides).some(item => item === slideId)) {
					const chapter = getChapter(structure.chapters, slideId);

					openFiles(rootPath, slideId);
					if (chapter) {
						openUrl(presentationPath, chapter, slideId);
					}
				} else {
					vscode.window.showInformationMessage('Сlipboard is empty!');

					const filePath = vscode.window.activeTextEditor.document.fileName;
					const fileName = getFileNameFromPath(filePath);
					const chapter = getChapter(structure.chapters, fileName);

					openFiles(rootPath, fileName);
					if (chapter) {
						openUrl(presentationPath, chapter, fileName);
					}
				}

			});
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
