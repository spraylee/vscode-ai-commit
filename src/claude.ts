import Anthropic from '@anthropic-ai/sdk';
import { Config } from './config';
import { logDebug } from './logger';

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
    thinking: { type: 'disabled' },
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Log response content types for debugging
  const contentTypes = response.content.map((c) => {
    if (c.type === 'thinking') {
      return `thinking(${c.thinking.length} chars)`;
    }
    if (c.type === 'text') {
      return `text(${c.text.length} chars)`;
    }
    return c.type;
  });
  logDebug(`Response content: ${contentTypes.join(', ')}`);
  if (response.content.some((c) => c.type === 'thinking')) {
    logDebug('WARNING: thinking block found despite disabled!');
  }

  // Extract text from response
  // Claude models with thinking enabled may return thinking block first, then text block
  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent) {
    const types = response.content.map((c) => c.type).join(', ');
    throw new Error(`API 响应中没有找到 text 类型，只有: ${types}`);
  }

  const message = textContent.text.trim();

  if (!message) {
    throw new Error('API 返回了空的 commit message');
  }

  return message;
}
