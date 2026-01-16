import * as vscode from 'vscode';
import type { DaemonClient } from '../client/daemon-client';
import * as path from 'path';

export async function debugTest(client: DaemonClient): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder');
    return;
  }

  const filePath = editor.document.fileName;
  const relativePath = path.relative(workspaceFolder.uri.fsPath, filePath);

  try {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'AIT: Analyzing test failure...',
        cancellable: false,
      },
      async () => {
        const result = await client.query({
          task: `Why does this test fail? Analyze the test file and related code.`,
          context: {
            task: `Why does this test fail? Analyze the test file and related code.`,
            current_file: relativePath,
            files: [relativePath],
          },
        });

        // Show analysis
        const analysis = typeof result === 'object' && result !== null && 'analysis' in result
          ? String(result.analysis)
          : JSON.stringify(result, null, 2);

        const doc = await vscode.workspace.openTextDocument({
          content: `# Test Failure Analysis: ${relativePath}\n\n${analysis}`,
          language: 'markdown',
        });
        await vscode.window.showTextDocument(doc);
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to analyze test: ${error}`);
  }
}
