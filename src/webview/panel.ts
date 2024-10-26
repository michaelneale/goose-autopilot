import * as vscode from 'vscode';

export class AutopilotPanel {
    public static currentPanel: AutopilotPanel | undefined;
    private static readonly viewType = 'gooseAutopilot';
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._panel.webview.html = this._getWebviewContent();
        this._panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'submitInstruction':
                        try {
                            const { createPlanYaml } = require('../utils/file');
                            // Create plan.yaml with instructions
                            const planPath = createPlanYaml(message.text);
                            
                            // Get all terminals and find our specific one
                            const terminals = vscode.window.terminals;
                            const gooseTerminal = terminals.find(t => t.name === 'goose working session');
                            if (gooseTerminal) {
                                // Execute the sq command with the plan file
                                const command = `sq goose session start --profile block --plan "${planPath}"`;
                                gooseTerminal.sendText(command);
                                gooseTerminal.show();
                            }
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to process instruction: ${error}`);
                        }
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (AutopilotPanel.currentPanel) {
            AutopilotPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            AutopilotPanel.viewType,
            'Goose Autopilot',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        AutopilotPanel.currentPanel = new AutopilotPanel(panel, extensionUri);
    }

    private _getWebviewContent() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Goose Autopilot</title>
            <style>
                body {
                    padding: 20px;
                    color: var(--vscode-foreground);
                    font-family: var(--vscode-font-family);
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .welcome {
                    margin-bottom: 20px;
                }
                .input-container {
                    margin-top: 20px;
                }
                textarea {
                    width: 100%;
                    height: 100px;
                    margin-bottom: 10px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    padding: 8px;
                }
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="welcome">
                    <h1>Welcome to Goose Autopilot! 🦢</h1>
                    <p>I'm here to help you manage your workspace and execute commands. Type your instructions below and I'll help you get things done.</p>
                </div>
                <div class="input-container">
                    <textarea id="instructionInput" placeholder="Enter your instructions here..."></textarea>
                    <button id="submitButton">Submit</button>
                </div>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                const textarea = document.getElementById('instructionInput');
                const submitButton = document.getElementById('submitButton');

                submitButton.addEventListener('click', () => {
                    const text = textarea.value;
                    if (text) {
                        vscode.postMessage({
                            command: 'submitInstruction',
                            text: text
                        });
                        textarea.value = '';
                    }
                });

                textarea.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                        submitButton.click();
                    }
                });
            </script>
        </body>
        </html>`;
    }

    public dispose() {
        AutopilotPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}