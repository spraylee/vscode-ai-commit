# AI Commit Message Generator

使用 Claude AI 自动生成 Git commit message 的 VSCode 扩展。

## 功能

- 在源代码管理视图添加一键生成按钮
- 分析当前变更和历史提交记录
- 遵循 Conventional Commits 规范：`type(scope): message`
- 自动填充到 commit message 输入框

## 安装

### 从 VSIX 安装

1. 下载最新版本的 `.vsix` 文件（ Releases 页面或自行构建）
2. 打开 VSCode
3. 点击扩展图标 → `...` → `Install from VSIX...`
4. 选择下载的 `.vsix` 文件

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/spraylee/vscode-ai-commit.git
cd vscode-ai-commit

# 安装依赖
npm install

# 构建
npm run build

# 打包生成 .vsix 文件
npm run package
```

## 配置

在 VSCode 设置中搜索 `aiCommit`，配置以下选项：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `aiCommit.apiKey` | Claude API Key（必填） | - |
| `aiCommit.baseUrl` | API Base URL（支持代理） | `https://api.anthropic.com` |
| `aiCommit.model` | 使用的模型 | `claude-haiku-4-5-20251001` |
| `aiCommit.maxHistoryCount` | 读取的历史提交数量 | `10` |
| `aiCommit.language` | 生成的 commit message 语言 | `en` |
| `aiCommit.customPrompt` | 自定义 prompt（追加到默认 prompt 后） | - |

### 获取 API Key

访问 [Anthropic Console](https://console.anthropic.com/) 获取 API Key。

## 使用方法

1. 确保已配置 `aiCommit.apiKey`
2. 打开一个 Git 仓库项目
3. 做一些代码修改
4. 在源代码管理视图标题栏点击 💡 图标
5. 扩展会自动生成 commit message 并填充到输入框
6. 检查生成的 message，确认无误后提交

## Commit Message 格式

生成的 commit message 遵循以下格式：

```
type(scope): message
```

### Type 类型

- `feat` - 新功能
- `fix` - 修复 bug
- `refactor` - 重构
- `style` - 样式调整
- `docs` - 文档
- `chore` - 杂项/配置
- `perf` - 性能优化
- `test` - 测试
- `ci` - CI/CD 变更

### 示例

- `feat(user): add logout btn`
- `fix(api): handle null response`
- `refactor: simplify auth logic`
- `chore: bump deps`

## 开发

```bash
# 安装依赖
npm install

# 编译
npm run compile

# 监听模式编译
npm run watch

# 按 F5 启动调试
```

## License

MIT
