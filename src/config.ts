import * as vscode from "vscode";

export interface Config {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxHistoryCount: number;
  language: string;
  customPrompt: string;
}

export function getConfig(): Config {
  const config = vscode.workspace.getConfiguration("aiCommit");

  return {
    apiKey: config.get<string>("apiKey", ""),
    baseUrl: config.get<string>("baseUrl", "https://api.anthropic.com"),
    model: config.get<string>("model", "claude-haiku-4-5-20251001"),
    maxHistoryCount: config.get<number>("maxHistoryCount", 10),
    language: config.get<string>("language", "en"),
    customPrompt: config.get<string>("customPrompt", ""),
  };
}

export function validateConfig(config: Config): string | null {
  if (!config.apiKey) {
    return "请先配置 Claude API Key";
  }

  if (!config.baseUrl) {
    return "请配置 API Base URL";
  }

  return null;
}
