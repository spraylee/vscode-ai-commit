import * as vscode from "vscode";

export type Provider = "claude" | "openai" | "azure" | "hunyuan";

export interface Config {
  provider: Provider;
  apiKey: string;
  baseUrl: string;
  model: string;
  maxHistoryCount: number;
  language: string;
  customPrompt: string;
  // Azure OpenAI 专用配置
  azureApiVersion: string;
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
  azure: {
    baseUrl: "",
    model: "gpt-4o-mini",
  },
  hunyuan: {
    baseUrl: "",
    model: "",
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
    azureApiVersion: config.get<string>("azureApiVersion", "") || "2024-12-01-preview",
  };
}

export function validateConfig(config: Config): string | null {
  if (!config.apiKey) {
    const providerNames = {
      claude: "Claude",
      openai: "OpenAI",
      azure: "Azure OpenAI",
      hunyuan: "混元",
    };
    return `请先配置 ${providerNames[config.provider]} API Key`;
  }

  if (config.provider === "azure" && !config.baseUrl) {
    return "请先配置 Azure OpenAI Endpoint (baseUrl)";
  }

  if (config.provider === "hunyuan") {
    if (!config.baseUrl) {
      return "请先配置混元 API Base URL";
    }
    if (!config.model) {
      return "请先配置混元模型名称";
    }
  }

  return null;
}
