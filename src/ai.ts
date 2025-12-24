import { Config } from "./config";
import { generateCommitMessage as generateWithClaude } from "./claude";
import { generateCommitMessage as generateWithOpenAI } from "./openai";

export async function generateCommitMessage(
  prompt: string,
  config: Config
): Promise<string> {
  if (config.provider === "openai") {
    return generateWithOpenAI(prompt, config);
  }
  return generateWithClaude(prompt, config);
}
