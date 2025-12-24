import { Config } from "./config";
import { generateCommitMessage as generateWithClaude } from "./claude";
import { generateCommitMessage as generateWithOpenAI } from "./openai";
import { generateCommitMessage as generateWithAzure } from "./azure";
import { generateCommitMessage as generateWithHunyuan } from "./hunyuan";

export async function generateCommitMessage(
  prompt: string,
  config: Config
): Promise<string> {
  if (config.provider === "openai") {
    return generateWithOpenAI(prompt, config);
  }
  if (config.provider === "azure") {
    return generateWithAzure(prompt, config);
  }
  if (config.provider === "hunyuan") {
    return generateWithHunyuan(prompt, config);
  }
  return generateWithClaude(prompt, config);
}
