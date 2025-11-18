import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { ChatMessage, ChatParams } from '../types';
import { SessionService } from './session.service';
import { SafetyService } from './safety.service';

export class ChatService {
  private static openaiClient: OpenAI | null = null;
  private static anthropicClient: Anthropic | null = null;

  /**
   * OpenAIクライアントを取得
   */
  private static getOpenAIClient(): OpenAI {
    if (!this.openaiClient) {
      this.openaiClient = new OpenAI({
        apiKey: config.llm.openai.apiKey,
      });
    }
    return this.openaiClient;
  }

  /**
   * Anthropicクライアントを取得
   */
  private static getAnthropicClient(): Anthropic {
    if (!this.anthropicClient) {
      this.anthropicClient = new Anthropic({
        apiKey: config.llm.anthropic.apiKey,
      });
    }
    return this.anthropicClient;
  }

  /**
   * システムプロンプトを取得
   */
  private static getSystemPrompt(): string {
    return `あなたは心の健康をサポートするAIコンパニオンです。以下の役割を持っています：

1. ユーザーの気持ちを傾聴し、共感的に対応する
2. 判断や批判をせず、安全な対話の場を提供する
3. 必要に応じて専門家への相談を促す
4. ユーザーの成長や自己理解をサポートする

重要な制約：
- あなたは医療専門家ではなく、診断や治療を行うことはできません
- 危機的な状況では、専門機関への相談を強く勧めてください
- ユーザーのプライバシーと安全を最優先してください

対話スタイル：
- 共感的で温かみのある言葉遣い
- 短く簡潔な返答を心がける
- オープンエンドな質問で対話を促進する`;
  }

  /**
   * OpenAIでチャット応答を生成
   */
  private static async chatWithOpenAI(
    messages: ChatMessage[]
  ): Promise<string> {
    const client = this.getOpenAIClient();

    const response = await client.chat.completions.create({
      model: config.llm.openai.model,
      messages: [
        { role: 'system', content: this.getSystemPrompt() },
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

  /**
   * Anthropicでチャット応答を生成
   */
  private static async chatWithAnthropic(
    messages: ChatMessage[]
  ): Promise<string> {
    const client = this.getAnthropicClient();

    const response = await client.messages.create({
      model: config.llm.anthropic.model,
      max_tokens: 500,
      system: this.getSystemPrompt(),
      messages: messages.map(m => ({
        role: m.role === 'ai' ? ('assistant' as const) : ('user' as const),
        content: m.content,
      })),
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }

  /**
   * チャット応答を生成（プロバイダー自動選択）
   */
  private static async generateResponse(
    messages: ChatMessage[]
  ): Promise<string> {
    if (config.llm.provider === 'anthropic') {
      return this.chatWithAnthropic(messages);
    } else {
      return this.chatWithOpenAI(messages);
    }
  }

  /**
   * ユーザーメッセージを処理してAI応答を返す
   */
  static async chat(params: ChatParams): Promise<{
    aiResponse: string;
    safetyWarning?: string;
  }> {
    const { sessionId, userMessage } = params;

    // セーフティチェック
    const safetyCheck = SafetyService.checkContent(userMessage);
    if (config.safety.enableChecks) {
      await SafetyService.recordSafetyFlags(sessionId, safetyCheck);
    }

    // ユーザーメッセージを保存
    await SessionService.addMessage(sessionId, 'user', userMessage);

    // クライシス対応が必要な場合
    if (!safetyCheck.isSafe) {
      const crisisResponse = SafetyService.getCrisisResponse();
      await SessionService.addMessage(sessionId, 'ai', crisisResponse);
      return {
        aiResponse: crisisResponse,
        safetyWarning: 'Critical safety keywords detected',
      };
    }

    // 過去のメッセージを取得
    const dbMessages = await SessionService.getSessionMessages(sessionId);
    const chatMessages: ChatMessage[] = dbMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'ai',
      content: m.content,
    }));

    // AI応答を生成
    const aiResponse = await this.generateResponse(chatMessages);

    // AI応答を保存
    await SessionService.addMessage(sessionId, 'ai', aiResponse);

    return {
      aiResponse,
      safetyWarning: safetyCheck.flags.length > 0
        ? 'Safety flags detected but not critical'
        : undefined,
    };
  }
}
