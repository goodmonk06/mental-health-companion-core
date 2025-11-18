import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { ChatMessage } from '../types';

export interface ILLMAdapter {
  generateResponse(messages: ChatMessage[], systemPrompt: string): Promise<string>;
  generateStructuredOutput<T>(
    messages: ChatMessage[],
    systemPrompt: string,
    schema: unknown
  ): Promise<T>;
}

export class OpenAIAdapter implements ILLMAdapter {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || config.llm.openai.apiKey,
    });
  }

  async generateResponse(messages: ChatMessage[], systemPrompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: config.llm.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || '';
  }

  async generateStructuredOutput<T>(
    messages: ChatMessage[],
    systemPrompt: string,
    _schema: unknown
  ): Promise<T> {
    const response = await this.client.chat.completions.create({
      model: config.llm.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
          content: m.content,
        })),
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content) as T;
  }
}

export class AnthropicAdapter implements ILLMAdapter {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || config.llm.anthropic.apiKey,
    });
  }

  async generateResponse(messages: ChatMessage[], systemPrompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: config.llm.anthropic.model,
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
        content: m.content,
      })),
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }

  async generateStructuredOutput<T>(
    messages: ChatMessage[],
    systemPrompt: string,
    _schema: unknown
  ): Promise<T> {
    const response = await this.client.messages.create({
      model: config.llm.anthropic.model,
      max_tokens: 1000,
      system: systemPrompt + '\n\nRespond ONLY with valid JSON.',
      messages: messages.map(m => ({
        role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
        content: m.content,
      })),
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '{}';

    // Extract JSON from potential markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;

    return JSON.parse(jsonText) as T;
  }
}

// Factory function
export function createLLMAdapter(provider?: string): ILLMAdapter {
  const selectedProvider = provider || config.llm.provider;

  switch (selectedProvider) {
    case 'anthropic':
      return new AnthropicAdapter();
    case 'openai':
    default:
      return new OpenAIAdapter();
  }
}
