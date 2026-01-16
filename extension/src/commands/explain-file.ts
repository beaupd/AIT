import * as vscode from 'vscode';
import type { DaemonClient } from '../client/daemon-client';
import * as path from 'path';
import * as fs from 'fs';

export async function explainFile(client: DaemonClient): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const filePath = editor.document.fileName;
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder');
    return;
  }

  const relativePath = path.relative(workspaceFolder.uri.fsPath, filePath);
  const content = editor.document.getText();

  try {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'AIT: Explaining file...',
        cancellable: false,
      },
      async () => {
        const result = await client.query({
          task: `Explain this file: ${relativePath}`,
          context: {
            task: `Explain this file: ${relativePath}`,
            current_file: relativePath,
            file_content: content,
          },
        });

        // Show explanation in a new document
        const explanation = typeof result === 'object' && result !== null && 'explanation' in result
          ? String(result.explanation)
          : JSON.stringify(result, null, 2);

        const doc = await vscode.workspace.openTextDocument({
          content: `# Explanation: ${relativePath}\n\n${explanation}`,
          language: 'markdown',
        });
        await vscode.window.showTextDocument(doc);
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to explain file: ${error}`);
  }
}
