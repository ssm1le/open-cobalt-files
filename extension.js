const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 **/


function activate(context) {
	function getFileNameFromPath(path) {
		return path.split("/").pop().replace(/\.[^.]*$/, '');
	}

	let disposable = vscode.commands.registerCommand('hrod.open', function () {
		const path = vscode.workspace.rootPath;
		const filepath = vscode.window.activeTextEditor.document.fileName;
		const fileName = getFileNameFromPath(filepath);

		console.log(fileName);

		vscode.env.clipboard.readText().then((slideId) => {
			if (!slideId) return;

			vscode.workspace.findFiles(`app/**/${slideId}.*`, path, 4)
				.then((TextDocuments) => {

					TextDocuments.forEach(document => {
						vscode.workspace.openTextDocument(document)

							.then((document) => {
								vscode.window.showTextDocument(document, vscode.ViewColumn.One, true);
							});
					});
				});
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
