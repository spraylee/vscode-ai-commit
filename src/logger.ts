import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel | null = null;

function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('AI Commit');
  }
  return outputChannel;
}

export function logRequest(options: {
  prompt: string;
  model: string;
  provider: string;
  thinking?: boolean;
}): void {
  const channel = getOutputChannel();
  const timestamp = new Date().toLocaleString();
  channel.appendLine(`\n${'='.repeat(60)}`);
  channel.appendLine(`[${timestamp}] Request to AI (${options.provider})`);
  channel.appendLine('='.repeat(60));
  channel.appendLine(`Model: ${options.model}`);
  channel.appendLine(`Thinking: ${options.thinking ? 'enabled' : 'disabled'}`);
  channel.appendLine(`Prompt length: ${options.prompt.length} chars`);
  channel.appendLine('-'.repeat(40));
  channel.appendLine(options.prompt);
  channel.appendLine('\n');
}

export function logDebug(message: string): void {
  const channel = getOutputChannel();
  channel.appendLine(`[DEBUG] ${message}`);
}

export function logResponse(response: string): void {
  const channel = getOutputChannel();
  const timestamp = new Date().toLocaleString();
  channel.appendLine(`\n[${timestamp}] Response from AI`);
  channel.appendLine('-'.repeat(40));
  channel.appendLine(response);
  channel.appendLine('');
}

export function logError(error: string): void {
  const channel = getOutputChannel();
  const timestamp = new Date().toLocaleString();
  channel.appendLine(`\n[${timestamp}] Error`);
  channel.appendLine('-'.repeat(40));
  channel.appendLine(error);
  channel.appendLine('');
}
