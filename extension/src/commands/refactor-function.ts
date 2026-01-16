import * as vscode from 'vscode';
import type { DaemonClient } from '../client/daemon-client';
import * as path from 'path';

export async function refactorFunction(client: DaemonClient): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const selection = editor.selection;
  if (selection.isEmpty) {
    vscode.window.showErrorMessage('Please select a function to refactor');
    return;
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('No workspace folder');
    return;
  }

  const filePath = editor.document.fileName;
  const relativePath = path.relative(workspaceFolder.uri.fsPath, filePath);
  const selectedCode = editor.document.getText(selection);

  const task = await vscode.window.showInputBox({
    prompt: 'What refactoring would you like to perform?',
    placeHolder: 'e.g., Extract method, Simplify logic, Improve naming',
  });

  if (!task) {
    return;
  }

  try {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'AIT: Refactoring function...',
        cancellable: false,
      },
      async () => {
        const result = await client.query({
          task: `Refactor this function: ${task}`,
          context: {
            task: `Refactor this function: ${task}`,
            current_file: relativePath,
            current_symbol: selectedCode,
            files: [relativePath],
          },
        });

        // Show diff or result
        if (typeof result === 'object' && result !== null && 'diffs' in result) {
          const diffs = result.diffs as Record<string, string>;
          const diff = diffs[relativePath];
          
          if (diff) {
            // Show diff in a new document
            const doc = await vscode.workspace.openTextDocument({
              content: `# Refactoring: ${relativePath}\n\n\`\`\`diff\n${diff}\n\`\`\``,
              language: 'markdown',
            });
            await vscode.window.showTextDocument(doc);

            // Ask if user wants to apply
            const apply = await vscode.window.showInformationMessage(
              'Refactoring generated. Apply changes?',
              'Apply',
              'Cancel'
            );

            if (apply === 'Apply') {
              // Apply diff (simplified - in production, use a proper diff parser)
              // For now, just show a message
              vscode.window.showInformationMessage('Diff application not yet implemented. Please apply manually.');
            }
          }
        } else {
          vscode.window.showInformationMessage(`Refactoring result: ${JSON.stringify(result)}`);
        }
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to refactor function: ${error}`);
  }
}
