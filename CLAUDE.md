# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VS Code 扩展，使用 AI (Claude/OpenAI/Azure/混元) 自动生成 Git commit message。遵循 Conventional Commits 规范 (`type(scope): message`)。

## Commands

```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run compile

# 监听模式编译（开发时使用）
npm run watch

# 打包生成 .vsix 文件
npm run package

# 按 F5 启动调试（需要先运行 npm install）
```

## Architecture

项目结构：

```
src/
├── extension.ts    # 扩展入口，注册 aiCommit.generate 命令
├── ai.ts           # AI 提供商路由，根据配置选择调用
├── config.ts       # 配置读取和验证
├── git.ts          # Git 操作：获取 diff 和历史提交
├── prompt.ts       # 构建发送给 AI 的 prompt
├── claude.ts       # Anthropic Claude API 实现
├── openai.ts       # OpenAI API 实现
├── azure.ts        # Azure OpenAI API 实现
└── hunyuan.ts      # 腾讯混元 API 实现
```

工作流程：`extension.ts` → `config.ts` 验证配置 → `git.ts` 获取 diff 和历史 → `prompt.ts` 构建 prompt → `ai.ts` 路由到对应 provider → 填充到 commit 输入框

## Key Details

- 快捷键：F4 触发生成
- 大文件过滤：自动忽略 lock 文件、二进制文件（图片、视频、PDF 等）
- 多仓库支持：多 workspace 时自动匹配工作区根目录
- thinking 模式已在代码中禁用
