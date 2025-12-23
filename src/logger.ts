import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel | null = null;

function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('AI Commit');
  }
  return outputChannel;
}

export function logRequest(prompt: string): void {
  const channel = getOutputChannel();
  const timestamp = new Date().toLocaleString();
  channel.appendLine(`\n${'='.repeat(60)}`);
  channel.appendLine(`[${timestamp}] Request to AI`);
  channel.appendLine('='.repeat(60));
  channel.appendLine(prompt);
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
