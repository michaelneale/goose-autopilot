import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('goose-autopilot.openAutopilot', async () => {
		try {
			// 1. Activate SCM view
			await vscode.commands.executeCommand('workbench.view.scm');
			
			// 2. Close all editors
			await vscode.commands.executeCommand('workbench.action.closeAllEditors');
			
			// 3. Create and show terminal named "goose working session"
			const terminal = vscode.window.createTerminal('goose working session');
			terminal.show();
			
			vscode.window.showInformationMessage('Goose Autopilot activated successfully!');
		} catch (error) {
			vscode.window.showErrorMessage('Failed to activate Goose Autopilot: ' + error);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}