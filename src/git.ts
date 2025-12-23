import * as vscode from 'vscode';

// Git extension API types
interface GitExtension {
  getAPI(version: number): Git;
}

interface Git {
  repositories: Repository[];
}

interface Repository {
  rootUri: vscode.Uri;
  inputBox: { value: string };
  state: RepositoryState;
  status(): Promise<void>;
  diff(cached?: boolean): Promise<string>;
  log(options?: LogOptions): Promise<Commit[]>;
}

interface RepositoryState {
  HEAD: Branch | undefined;
  workingTreeChanges: Change[];
  indexChanges: Change[];
  untrackedChanges: Change[];
}

interface Branch {
  name?: string;
  commit?: string;
}

interface Change {
  uri: vscode.Uri;
  status: number;
}

interface LogOptions {
  maxEntries?: number;
}

interface Commit {
  hash: string;
  message: string;
  authorName?: string;
  authorDate?: Date;
}

export interface GitInfo {
  diff: string;
  historyCommits: string[];
  repository: Repository;
}

export async function getGitExtension(): Promise<Git | null> {
  const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git');

  if (!gitExtension) {
    return null;
  }

  if (!gitExtension.isActive) {
    await gitExtension.activate();
  }

  return gitExtension.exports.getAPI(1);
}

async function readFileContent(uri: vscode.Uri): Promise<string> {
  try {
    const content = await vscode.workspace.fs.readFile(uri);
    return Buffer.from(content).toString('utf-8');
  } catch {
    return '';
  }
}

async function generateUntrackedDiff(changes: Change[], rootPath: string): Promise<string> {
  const diffs: string[] = [];

  for (const change of changes) {
    const relativePath = change.uri.fsPath.replace(rootPath + '/', '');
    const content = await readFileContent(change.uri);

    if (content) {
      const lines = content.split('\n');
      const diffLines = lines.map((line) => `+${line}`).join('\n');
      diffs.push(`diff --git a/${relativePath} b/${relativePath}
new file mode 100644
--- /dev/null
+++ b/${relativePath}
@@ -0,0 +1,${lines.length} @@
${diffLines}`);
    }
  }

  return diffs.join('\n\n');
}

export async function getGitInfo(maxHistoryCount: number): Promise<GitInfo> {
  const git = await getGitExtension();

  if (!git) {
    throw new Error('未找到 Git 扩展，请确保已安装 Git 扩展');
  }

  if (git.repositories.length === 0) {
    throw new Error('未找到 Git 仓库，请打开一个 Git 项目');
  }

  const repository = git.repositories[0];

  // Refresh git status to ensure we have latest state
  await repository.status();

  const state = repository.state;
  const rootPath = repository.rootUri.fsPath;

  // Debug: log state info
  const output = vscode.window.createOutputChannel('AI Commit Debug');
  output.appendLine(`=== Git State Debug ===`);
  output.appendLine(`rootPath: ${rootPath}`);
  output.appendLine(`indexChanges (staged): ${state.indexChanges.length}`);
  state.indexChanges.forEach((c) => output.appendLine(`  - ${c.uri.fsPath}`));
  output.appendLine(`workingTreeChanges (unstaged): ${state.workingTreeChanges.length}`);
  state.workingTreeChanges.forEach((c) => output.appendLine(`  - ${c.uri.fsPath}`));
  output.appendLine(`untrackedChanges: ${state.untrackedChanges?.length ?? 'undefined'}`);
  state.untrackedChanges?.forEach((c) => output.appendLine(`  - ${c.uri.fsPath}`));
  output.appendLine(`state keys: ${Object.keys(state).join(', ')}`);
  output.show();

  // Check for changes (staged, unstaged, or untracked)
  const hasStagedChanges = state.indexChanges.length > 0;
  const hasUnstagedChanges = state.workingTreeChanges.length > 0;
  const hasUntrackedChanges = state.untrackedChanges?.length > 0;

  output.appendLine(`hasStagedChanges: ${hasStagedChanges}`);
  output.appendLine(`hasUnstagedChanges: ${hasUnstagedChanges}`);
  output.appendLine(`hasUntrackedChanges: ${hasUntrackedChanges}`);

  if (!hasStagedChanges && !hasUnstagedChanges && !hasUntrackedChanges) {
    throw new Error('没有任何变更可以提交');
  }

  // Get diff: if staged exists, use staged only; otherwise collect all changes
  const diffParts: string[] = [];

  if (hasStagedChanges) {
    // User has staged specific changes, use only those
    const stagedDiff = await repository.diff(true);
    output.appendLine(`stagedDiff length: ${stagedDiff?.length ?? 0}`);
    if (stagedDiff?.trim()) {
      diffParts.push(stagedDiff);
    }
  } else {
    // No staged changes, collect all: unstaged + untracked
    if (hasUnstagedChanges) {
      const unstagedDiff = await repository.diff(false);
      output.appendLine(`unstagedDiff length: ${unstagedDiff?.length ?? 0}`);
      if (unstagedDiff?.trim()) {
        diffParts.push(unstagedDiff);
      }
    }
    if (hasUntrackedChanges) {
      const untrackedDiff = await generateUntrackedDiff(state.untrackedChanges, rootPath);
      output.appendLine(`untrackedDiff length: ${untrackedDiff?.length ?? 0}`);
      if (untrackedDiff?.trim()) {
        diffParts.push(untrackedDiff);
      }
    }
  }

  const diff = diffParts.join('\n\n');
  output.appendLine(`final diff length: ${diff.length}`);

  if (!diff || diff.trim() === '') {
    throw new Error('没有可用的 diff 内容');
  }

  // Get history commits
  const commits = await repository.log({ maxEntries: maxHistoryCount });
  const historyCommits = commits.map((commit) => commit.message);

  return {
    diff,
    historyCommits,
    repository,
  };
}
