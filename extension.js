const vscode = require('vscode');
const fs = require('fs');
const ignoreWorkspace = [
	'app/data/kpi/*',
	'app/media/**',
];

function getFileNameFromPath(filePath) {
	return filePath.split("/").pop().replace(/\.[^.]*$/, '');
}

function parseJsData(filename) {
	let json = fs.readFileSync(filename, 'utf8')
		.replace(/\s*\/\/.+/g, '')
		.replace(/,(\s*\})/g, '}')
	return JSON.parse(json);
}

function getPathToPresentation(filePath) {
	return filePath.split("/projects/").pop();
}

function openFiles(path, slideId) {
	vscode.workspace.findFiles(
		new vscode.RelativePattern(path, `{app/**/${slideId}.*}`),
		new vscode.RelativePattern(path, `{${ignoreWorkspace.join(',')}}`),
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
}
function openUrl(path, chapter, slide) {
	vscode.env.openExternal(vscode.Uri.parse(`http://localhost/${path}/#/${chapter}/${slide}`));
}

/**
 * @param {vscode.ExtensionContext} context
 **/

function activate(context) {

	let disposable = vscode.commands.registerCommand('hrod.open', function () {
		const path = vscode.workspace.rootPath;
		const presentationPath = getPathToPresentation(path);
		const structure = parseJsData(`${path}/structure.json`);

		vscode.env.clipboard.readText()
			.then((slideId) => {
				if (Object.keys(structure.slides).some(item => item === slideId)) {
					const chapter = getChapter(structure.chapters, slideId);

					openFiles(path, slideId);
					openUrl(presentationPath, chapter, slideId);
				} else {
					vscode.window.showInformationMessage('Сlipboard is empty!');

					const filePath = vscode.window.activeTextEditor.document.fileName;
					const fileName = getFileNameFromPath(filePath);
					const chapter = getChapter(structure.chapters, fileName);

					openFiles(path, fileName);
					openUrl(presentationPath, chapter, fileName);
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
