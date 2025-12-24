import { Config } from "./config";

export async function generateCommitMessage(
  prompt: string,
  config: Config
): Promise<string> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: config.apiKey,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
      temperature: 0,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`混元 API 请求失败: ${response.statusText} ${text}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
    error?: { message: string };
  };

  if (data.error?.message) {
    throw new Error(`混元 API 错误: ${data.error.message}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("API 返回了空的 commit message");
  }

  return content.trim();
}
