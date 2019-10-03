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

/**
 * @param {vscode.ExtensionContext} context
 **/


function activate(context) {

	let disposable = vscode.commands.registerCommand('hrod.open', function () {
		const path = vscode.workspace.rootPath;
		const structure = parseJsData(`${path}/structure.json`);

		vscode.env.clipboard.readText().then((slideId) => {
			console.log();
			
			if (Object.keys(structure.slides).some(item => item === slideId)) {
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
			} else {
				const filePath = vscode.window.activeTextEditor.document.fileName;
				const fileName = getFileNameFromPath(filePath);
				vscode.workspace.findFiles(
					new vscode.RelativePattern(path, `{app/**/${fileName}.*}`),
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
