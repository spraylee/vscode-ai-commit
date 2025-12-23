import Anthropic from '@anthropic-ai/sdk';
import { Config } from './config';

export async function generateCommitMessage(
  prompt: string,
  config: Config
): Promise<string> {
  const client = new Anthropic({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  });

  const response = await client.messages.create({
    model: config.model,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Extract text from response
  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('API 返回了非预期的响应格式');
  }

  const message = content.text.trim();

  if (!message) {
    throw new Error('API 返回了空的 commit message');
  }

  return message;
}
