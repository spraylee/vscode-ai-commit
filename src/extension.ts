import * as vscode from 'vscode';
import { getConfig, validateConfig } from './config';
import { getGitInfo } from './git';
import { buildPrompt } from './prompt';
import { generateCommitMessage } from './claude';
import { logRequest, logResponse, logError } from './logger';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('aiCommit.generate', async () => {
    try {
      // Get and validate config
      const config = getConfig();
      const configError = validateConfig(config);

      if (configError) {
        const action = await vscode.window.showErrorMessage(configError, '打开设置');
        if (action === '打开设置') {
          vscode.commands.executeCommand('workbench.action.openSettings', 'aiCommit');
        }
        return;
      }

      // Show progress
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'AI Commit',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ message: '正在获取 Git 信息...' });

          // Get git info
          const gitInfo = await getGitInfo(config.maxHistoryCount);

          progress.report({ message: '正在生成 commit message...' });

          // Build prompt
          const prompt = buildPrompt({
            historyCommits: gitInfo.historyCommits,
            diffContent: gitInfo.diff,
            language: config.language,
            customPrompt: config.customPrompt,
          });

          // Log request
          logRequest(prompt);

          // Generate commit message
          const commitMessage = await generateCommitMessage(prompt, config);

          // Log response
          logResponse(commitMessage);

          // Fill in the input box
          gitInfo.repository.inputBox.value = commitMessage;

          vscode.window.showInformationMessage('Commit message 已生成');
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : '生成失败';
      logError(message);
      vscode.window.showErrorMessage(`AI Commit: ${message}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
