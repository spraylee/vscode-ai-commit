import OpenAI from "openai";
import { Config } from "./config";

export async function generateCommitMessage(
  prompt: string,
  config: Config
): Promise<string> {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  });

  const response = await client.chat.completions.create({
    model: config.model,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("API 返回了空的 commit message");
  }

  return content.trim();
}
