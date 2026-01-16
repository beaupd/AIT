import * as vscode from 'vscode';
import { DaemonClient } from './client/daemon-client';
import { explainFile } from './commands/explain-file';
import { refactorFunction } from './commands/refactor-function';
import { debugTest } from './commands/debug-test';
import { summarizeStandards } from './commands/summarize-standards';

let daemonProcess: any = null;

export async function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('ait');
    const port = config.get<number>('daemonPort', 3001);
    const client = new DaemonClient(port);

    // Check daemon connection
    const connected = await client.checkConnection();
    if (!connected) {
        const startDaemon = await vscode.window.showWarningMessage(
            'AIT daemon is not running. Would you like to start it?',
            'Start Daemon',
            'Cancel'
        );

        if (startDaemon === 'Start Daemon') {
            await startDaemonProcess(context, port);
        }
    }

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('ait.explainFile', () => explainFile(client)),
        vscode.commands.registerCommand('ait.refactorFunction', () => refactorFunction(client)),
        vscode.commands.registerCommand('ait.debugTest', () => debugTest(client)),
        vscode.commands.registerCommand('ait.summarizeStandards', () => summarizeStandards(client)),
        vscode.commands.registerCommand('ait.indexProject', async () => {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (workspaceFolder) {
                try {
                    await client.index({ project_path: workspaceFolder.uri.fsPath });
                    vscode.window.showInformationMessage('Project indexed successfully');
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to index project: ${error}`);
                }
            } else {
                vscode.window.showErrorMessage('No workspace folder open');
            }
        })
    );

    // Show status in status bar
    updateStatusBar(context, connected);
}

async function startDaemonProcess(context: vscode.ExtensionContext, port: number): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    const config = vscode.workspace.getConfiguration('ait');
    const ollamaUrl = config.get<string>('ollamaUrl', 'http://localhost:11434');
    const embeddingModel = config.get<string>('embeddingModel', 'nomic-embed-text');
    const generationModel = config.get<string>('generationModel', 'llama3.2:3b');

    const { spawn } = await import('child_process');
    const path = await import('path');
    
    const daemonPath = path.join(context.extensionPath, '..', 'daemon', 'dist', 'index.js');
    
    daemonProcess = spawn('node', [daemonPath, workspaceFolder.uri.fsPath], {
        env: { 
            ...process.env, 
            PORT: port.toString(),
            OLLAMA_BASE_URL: ollamaUrl,
            OLLAMA_EMBEDDING_MODEL: embeddingModel,
            OLLAMA_GENERATION_MODEL: generationModel,
        },
        stdio: 'pipe',
    });

    daemonProcess.stdout.on('data', (data: Buffer) => {
        console.log(`Daemon: ${data.toString()}`);
    });

    daemonProcess.stderr.on('data', (data: Buffer) => {
        console.error(`Daemon error: ${data.toString()}`);
    });

    daemonProcess.on('close', (code: number) => {
        console.log(`Daemon process exited with code ${code}`);
        daemonProcess = null;
    });

    context.subscriptions.push({
        dispose: () => {
            if (daemonProcess) {
                daemonProcess.kill();
            }
        }
    });
}

function updateStatusBar(context: vscode.ExtensionContext, connected: boolean): void {
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = connected ? '$(check) AIT' : '$(alert) AIT';
    statusBar.tooltip = connected ? 'AIT daemon is running' : 'AIT daemon is not running';
    statusBar.show();
    context.subscriptions.push(statusBar);
}

export function deactivate() {
    if (daemonProcess) {
        daemonProcess.kill();
    }
}
