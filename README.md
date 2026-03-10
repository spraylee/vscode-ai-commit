# AI Commit Message Generator

[![Version](https://img.shields.io/visual-studio-marketplace/v/sprayli.vscode-ai-commit)](https://marketplace.visualstudio.com/items?itemName=sprayli.vscode-ai-commit)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/sprayli.vscode-ai-commit)](https://marketplace.visualstudio.com/items?itemName=sprayli.vscode-ai-commit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A VS Code extension that uses AI to automatically generate Git commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification.

[中文文档](#中文文档)

## Features

- **Multiple AI Providers**: Claude, OpenAI, Azure OpenAI, Hunyuan
- **One-click generation** from the Source Control view
- **Context-aware**: Analyzes current changes and commit history
- **Conventional Commits** format: `type(scope): message`
- **Auto-fill** the commit message input box

## Installation

Search for **AI Commit Message Generator** in the VS Code Extensions Marketplace, or install from the command line:

```bash
code --install-extension sprayli.vscode-ai-commit
```

## Configuration

Search `aiCommit` in VS Code Settings to configure:

| Setting | Description | Default |
|---------|-------------|---------|
| `aiCommit.provider` | AI provider | `openai` |
| `aiCommit.apiKey` | API Key (required) | - |
| `aiCommit.baseUrl` | API Base URL (leave empty for default) | - |
| `aiCommit.model` | Model name (leave empty for default) | - |
| `aiCommit.azureApiVersion` | Azure API version (Azure only) | - |
| `aiCommit.maxHistoryCount` | Number of history commits to read | `10` |
| `aiCommit.language` | Commit message language (e.g., `en`, `zh-CN`) | `en` |
| `aiCommit.customPrompt` | Custom prompt appended to default | - |

### Supported AI Providers

| Provider | Default Base URL | Default Model |
|----------|-----------------|---------------|
| `claude` | `https://api.anthropic.com` | `claude-haiku-4-5-20251001` |
| `openai` | `https://api.openai.com/v1` | `gpt-4o-mini` |
| `azure` | Your Azure endpoint | `gpt-4o-mini` |
| `hunyuan` | `https://api.hunyuan.cloud.tencent.com/v1` | `hunyuan-turbos-latest` |

### Getting API Keys

- **Claude**: [Anthropic Console](https://console.anthropic.com/)
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/)
- **Azure OpenAI**: [Azure Portal](https://portal.azure.com/)
- **Hunyuan**: [Tencent Cloud Console](https://console.cloud.tencent.com/hunyuan)

## Usage

1. Configure `aiCommit.apiKey` in VS Code Settings
2. Open a Git repository project
3. Make some code changes
4. Click the lightbulb icon in the Source Control title bar (or press **F4**)
5. The extension generates a commit message and fills it in the input box
6. Review and commit

## Commit Message Format

```
type(scope): message
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactoring |
| `style` | Style changes |
| `docs` | Documentation |
| `chore` | Maintenance / config |
| `perf` | Performance improvement |
| `test` | Tests |
| `ci` | CI/CD changes |

### Examples

- `feat(user): add logout btn`
- `fix(api): handle null response`
- `refactor: simplify auth logic`
- `chore: bump deps`

---

# 中文文档

使用 AI 自动生成 Git commit message 的 VS Code 扩展。

## 功能

- **多种 AI 服务**：Claude、OpenAI、Azure OpenAI、混元
- 在源代码管理视图添加**一键生成**按钮
- **上下文感知**：分析当前变更和历史提交记录
- 遵循 **Conventional Commits** 规范：`type(scope): message`
- 自动填充到 commit message 输入框

## 安装

在 VS Code 扩展市场搜索 **AI Commit Message Generator** 即可安装。

也可以从命令行安装：

```bash
code --install-extension sprayli.vscode-ai-commit
```

### 从源码构建

```bash
git clone https://github.com/spraylee/vscode-ai-commit.git
cd vscode-ai-commit
npm install
npm run build
npm run package
```

## 配置

在 VS Code 设置中搜索 `aiCommit`，配置以下选项：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `aiCommit.provider` | AI 服务提供商 | `openai` |
| `aiCommit.apiKey` | API Key（必填） | - |
| `aiCommit.baseUrl` | API Base URL（留空使用默认值） | - |
| `aiCommit.model` | 使用的模型（留空使用默认值） | - |
| `aiCommit.azureApiVersion` | Azure API 版本（仅 Azure） | - |
| `aiCommit.maxHistoryCount` | 读取的历史提交数量 | `10` |
| `aiCommit.language` | 生成的 commit message 语言 | `en` |
| `aiCommit.customPrompt` | 自定义 prompt（追加到默认 prompt 后） | - |

### 支持的 AI 服务

| Provider | 默认 Base URL | 默认模型 |
|----------|--------------|---------|
| `claude` | `https://api.anthropic.com` | `claude-haiku-4-5-20251001` |
| `openai` | `https://api.openai.com/v1` | `gpt-4o-mini` |
| `azure` | 需要配置你的 Azure endpoint | `gpt-4o-mini` |
| `hunyuan` | `https://api.hunyuan.cloud.tencent.com/v1` | `hunyuan-turbos-latest` |

### 获取 API Key

- **Claude**: [Anthropic Console](https://console.anthropic.com/)
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/)
- **Azure OpenAI**: [Azure Portal](https://portal.azure.com/)
- **混元**: [腾讯云控制台](https://console.cloud.tencent.com/hunyuan)

## 使用方法

1. 在 VS Code 设置中配置 `aiCommit.apiKey`
2. 打开一个 Git 仓库项目
3. 做一些代码修改
4. 在源代码管理视图标题栏点击灯泡图标（或按 **F4**）
5. 扩展会自动生成 commit message 并填充到输入框
6. 检查生成的 message，确认无误后提交

## 开发

```bash
npm install
npm run compile
npm run watch
# 按 F5 启动调试
```

## License

MIT
