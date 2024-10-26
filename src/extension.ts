import * as vscode from 'vscode';
import { AutopilotPanel } from './webview/panel';

export function activate(context: vscode.ExtensionContext) {
    console.log('Activating Goose Autopilot extension');
	let disposable = vscode.commands.registerCommand('goose-autopilot.openAutopilot', async () => {
            console.log('Command goose-autopilot.openAutopilot triggered');
		try {
			// 1. Activate SCM view
			await vscode.commands.executeCommand('workbench.view.scm');
			
			// 2. Close all editors
			await vscode.commands.executeCommand('workbench.action.closeAllEditors');
			
			// 3. Create terminal named "goose working session" (hidden initially)
			const terminal = vscode.window.createTerminal('goose working session');
			
			// 4. Hide the bottom panel
			await vscode.commands.executeCommand('workbench.action.togglePanel');
			
			// 5. Create and show the webview panel
			AutopilotPanel.createOrShow(context.extensionUri);
			
			vscode.window.showInformationMessage('Goose Autopilot activated successfully!');
		} catch (error) {
			vscode.window.showErrorMessage('Failed to activate Goose Autopilot: ' + error);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}