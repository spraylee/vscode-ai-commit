export interface PromptParams {
  historyCommits: string[];
  diffContent: string;
  language: string;
  customPrompt: string;
}

export function buildPrompt(params: PromptParams): string {
  const { historyCommits, diffContent, language, customPrompt } = params;

  const historySection =
    historyCommits.length > 0
      ? historyCommits.map((msg, i) => `${i + 1}. ${msg}`).join('\n')
      : '(no history)';

  let prompt = `You are a Git commit message generator.

## Format
\`type(scope): message\`

## Type
- feat - new feature
- fix - bug fix
- refactor - code refactoring
- style - formatting, no logic change
- docs - documentation
- chore - config, deps, misc
- perf - performance
- test - tests
- ci - CI/CD changes

## Scope Rules
- Based on main directory/module modified
- For multi-module changes, pick the primary one or omit scope
- Keep short: api, ui, config, auth, etc.

## Message Rules
- Use ${language} language
- Describe intent, not details
- Use common abbreviations: rm, init, config, impl, btn, etc.
- All lowercase, no period
- Under 50 characters total

## Good Examples
- feat(user): add logout btn
- fix(api): handle null response
- refactor: simplify auth logic
- chore: bump deps

## Bad Examples (too verbose)
- fix(scroll-easter-egg): assign animation to leaveTween for proper cleanup
- Should be: fix(scroll): fix tween cleanup

## History Reference
${historySection}

## Current Changes
\`\`\`diff
${diffContent}
\`\`\`

## Output Rules
- Output exactly ONE commit message for ALL changes combined
- Do NOT output multiple lines or multiple commits
- Summarize all changes into a single commit message
- No quotes, no explanation, no markdown`;

  if (customPrompt) {
    prompt += `\n\n## Additional Requirements\n${customPrompt}`;
  }

  return prompt;
}
