const vscode = require('vscode');
const open = require('./open-files.js');

/**
 * @param {vscode.ExtensionContext} context
 **/

function activate(context) {

	const subscriptions = [
		vscode.commands.registerCommand("hrod.open", open.openCobaltFiles),
		vscode.commands.registerCommand("hrod.model", () => { }),
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


