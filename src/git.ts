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
  diff(cached?: boolean): Promise<string>;
  log(options?: LogOptions): Promise<Commit[]>;
}

interface RepositoryState {
  HEAD: Branch | undefined;
  workingTreeChanges: Change[];
  indexChanges: Change[];
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

export async function getGitInfo(maxHistoryCount: number): Promise<GitInfo> {
  const git = await getGitExtension();

  if (!git) {
    throw new Error('未找到 Git 扩展，请确保已安装 Git 扩展');
  }

  if (git.repositories.length === 0) {
    throw new Error('未找到 Git 仓库，请打开一个 Git 项目');
  }

  const repository = git.repositories[0];
  const state = repository.state;

  // Check for changes (staged or unstaged)
  const hasStagedChanges = state.indexChanges.length > 0;
  const hasUnstagedChanges = state.workingTreeChanges.length > 0;

  if (!hasStagedChanges && !hasUnstagedChanges) {
    throw new Error('没有任何变更可以提交');
  }

  // Get diff: prefer staged changes, fallback to all changes
  let diff: string;
  if (hasStagedChanges) {
    // Get staged changes only
    diff = await repository.diff(true);
  } else {
    // No staged changes, get all changes
    diff = await repository.diff(false);
  }

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
