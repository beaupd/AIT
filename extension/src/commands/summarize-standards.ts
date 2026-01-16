import * as vscode from 'vscode';
import type { DaemonClient } from '../client/daemon-client';

export async function summarizeStandards(client: DaemonClient): Promise<void> {
  try {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'AIT: Summarizing project conventions...',
        cancellable: false,
      },
      async () => {
        const result = await client.query({
          task: 'Summarize project conventions and standards',
          context: {
            task: 'Summarize project conventions and standards',
          },
        });

        // Show summary
        const summary = typeof result === 'object' && result !== null && 'standards' in result
          ? JSON.stringify(result.standards, null, 2)
          : JSON.stringify(result, null, 2);

        const doc = await vscode.workspace.openTextDocument({
          content: `# Project Standards Summary\n\n${summary}`,
          language: 'markdown',
        });
        await vscode.window.showTextDocument(doc);
      }
    );
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to summarize standards: ${error}`);
  }
}
