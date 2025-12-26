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

// Git status codes
// See: https://github.com/microsoft/vscode/blob/main/extensions/git/src/api/git.d.ts
enum Status {
  INDEX_MODIFIED = 0,
  INDEX_ADDED = 1,
  INDEX_DELETED = 2,
  INDEX_RENAMED = 3,
  INDEX_COPIED = 4,
  MODIFIED = 5,
  DELETED = 6,
  UNTRACKED = 7,
  IGNORED = 8,
  INTENT_TO_ADD = 9,
  INTENT_TO_RENAME = 10,
  TYPE_CHANGED = 11,
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

// Built-in ignore patterns for large/lock files
const IGNORED_FILE_PATTERNS = [
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lockb',
  'composer.lock',
  'Gemfile.lock',
  'Cargo.lock',
  'poetry.lock',
  'Pipfile.lock',
  'packages.lock.json', // NuGet
  'paket.lock', // .NET Paket
  'shrinkwrap.yaml', // pnpm
  '*.min.js',
  '*.min.css',
  '*.map', // source maps
];

function isIgnoredFile(filePath: string): boolean {
  const fileName = filePath.split('/').pop() || '';
  return IGNORED_FILE_PATTERNS.some((pattern) => {
    if (pattern.startsWith('*')) {
      return fileName.endsWith(pattern.slice(1));
    }
    return fileName === pattern;
  });
}

interface DiffFilterResult {
  filteredDiff: string;
  ignoredSummaries: string[];
}

function parseDiffStats(diffContent: string): { additions: number; deletions: number } {
  const lines = diffContent.split('\n');
  let additions = 0;
  let deletions = 0;

  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      additions++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;
    }
  }

  return { additions, deletions };
}

function filterDiffByIgnoreList(rawDiff: string): DiffFilterResult {
  // Split diff into individual file diffs
  const fileDiffs = rawDiff.split(/(?=^diff --git )/m).filter((d) => d.trim());

  const filteredParts: string[] = [];
  const ignoredSummaries: string[] = [];

  for (const fileDiff of fileDiffs) {
    // Extract file path from diff header: diff --git a/path b/path
    const match = fileDiff.match(/^diff --git a\/(.+?) b\//);
    if (!match) {
      filteredParts.push(fileDiff);
      continue;
    }

    const filePath = match[1];

    if (isIgnoredFile(filePath)) {
      const stats = parseDiffStats(fileDiff);
      ignoredSummaries.push(`${filePath}: +${stats.additions} -${stats.deletions} lines (content too large, showing summary only)`);
    } else {
      filteredParts.push(fileDiff);
    }
  }

  return {
    filteredDiff: filteredParts.join('\n'),
    ignoredSummaries,
  };
}

function selectRepository(repositories: Repository[]): Repository {
  if (repositories.length === 1) {
    return repositories[0];
  }

  // Try to match workspace root folder
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    const rootPath = workspaceFolders[0].uri.fsPath;
    const matched = repositories.find((repo) => repo.rootUri.fsPath === rootPath);
    if (matched) {
      return matched;
    }
  }

  // Fallback to first repository
  return repositories[0];
}

export async function getGitInfo(maxHistoryCount: number): Promise<GitInfo> {
  const git = await getGitExtension();

  if (!git) {
    throw new Error('未找到 Git 扩展，请确保已安装 Git 扩展');
  }

  if (git.repositories.length === 0) {
    throw new Error('未找到 Git 仓库，请打开一个 Git 项目');
  }

  const repository = selectRepository(git.repositories);

  // Refresh git status to ensure we have latest state
  await repository.status();

  const state = repository.state;
  const rootPath = repository.rootUri.fsPath;

  // Separate tracked and untracked changes in workingTreeChanges
  const trackedChanges = state.workingTreeChanges.filter((c) => c.status !== Status.UNTRACKED);
  const untrackedInWorkingTree = state.workingTreeChanges.filter((c) => c.status === Status.UNTRACKED);
  const allUntrackedChanges = [...(state.untrackedChanges || []), ...untrackedInWorkingTree];

  // Check for changes
  const hasStagedChanges = state.indexChanges.length > 0;
  const hasTrackedChanges = trackedChanges.length > 0;
  const hasUntrackedChanges = allUntrackedChanges.length > 0;

  if (!hasStagedChanges && !hasTrackedChanges && !hasUntrackedChanges) {
    throw new Error('没有任何变更可以提交');
  }

  // Get diff: if staged exists, use staged only; otherwise collect all changes
  const diffParts: string[] = [];
  let allIgnoredSummaries: string[] = [];

  if (hasStagedChanges) {
    // User has staged specific changes, use only those
    const stagedDiff = await repository.diff(true);
    if (stagedDiff?.trim()) {
      const { filteredDiff, ignoredSummaries } = filterDiffByIgnoreList(stagedDiff);
      if (filteredDiff.trim()) {
        diffParts.push(filteredDiff);
      }
      allIgnoredSummaries = allIgnoredSummaries.concat(ignoredSummaries);
    }
  } else {
    // No staged changes, collect all: tracked changes + untracked files
    if (hasTrackedChanges) {
      const trackedDiff = await repository.diff(false);
      if (trackedDiff?.trim()) {
        const { filteredDiff, ignoredSummaries } = filterDiffByIgnoreList(trackedDiff);
        if (filteredDiff.trim()) {
          diffParts.push(filteredDiff);
        }
        allIgnoredSummaries = allIgnoredSummaries.concat(ignoredSummaries);
      }
    }
    if (hasUntrackedChanges) {
      // Filter untracked files before generating diff
      const filteredUntracked = allUntrackedChanges.filter((change) => {
        const relativePath = change.uri.fsPath.replace(rootPath + '/', '');
        if (isIgnoredFile(relativePath)) {
          // Count lines for ignored untracked files
          allIgnoredSummaries.push(`${relativePath}: new file (content too large, showing summary only)`);
          return false;
        }
        return true;
      });

      if (filteredUntracked.length > 0) {
        const untrackedDiff = await generateUntrackedDiff(filteredUntracked, rootPath);
        if (untrackedDiff?.trim()) {
          diffParts.push(untrackedDiff);
        }
      }
    }
  }

  // Build final diff with ignored file summaries
  let diff = diffParts.join('\n\n');

  if (allIgnoredSummaries.length > 0) {
    const summarySection = allIgnoredSummaries.join('\n');
    diff = diff ? `${diff}\n\n${summarySection}` : summarySection;
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
