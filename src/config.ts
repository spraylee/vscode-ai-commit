import * as vscode from "vscode";

export type Provider = "claude" | "openai";

export interface Config {
  provider: Provider;
  apiKey: string;
  baseUrl: string;
  model: string;
  maxHistoryCount: number;
  language: string;
  customPrompt: string;
}

const DEFAULT_CONFIG = {
  claude: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-haiku-4-5-20251001",
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
};

export function getConfig(): Config {
  const config = vscode.workspace.getConfiguration("aiCommit");
  const provider = config.get<Provider>("provider", "claude");

  const baseUrl = config.get<string>("baseUrl", "");
  const model = config.get<string>("model", "");

  return {
    provider,
    apiKey: config.get<string>("apiKey", ""),
    baseUrl: baseUrl || DEFAULT_CONFIG[provider].baseUrl,
    model: model || DEFAULT_CONFIG[provider].model,
    maxHistoryCount: config.get<number>("maxHistoryCount", 10),
    language: config.get<string>("language", "en"),
    customPrompt: config.get<string>("customPrompt", ""),
  };
}

export function validateConfig(config: Config): string | null {
  if (!config.apiKey) {
    return `请先配置 ${config.provider === "claude" ? "Claude" : "OpenAI"} API Key`;
  }

  return null;
}
