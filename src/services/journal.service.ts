import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { JournalEntry } from '@prisma/client';
import { config } from '../config';
import prisma from '../lib/prisma';
import { SessionService } from './session.service';
import { JournalGenerationResult } from '../types';

export class JournalService {
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
   * 会話履歴からジャーナルを生成（OpenAI）
   */
  private static async generateJournalWithOpenAI(
    conversationText: string
  ): Promise<JournalGenerationResult> {
    const client = this.getOpenAIClient();

    const prompt = `以下の会話履歴から、ユーザーの心の状態を整理したジャーナルエントリを生成してください。

会話履歴:
${conversationText}

以下のJSON形式で出力してください：
{
  "title": "今日の気持ちを表すタイトル（20文字以内）",
  "summary": "会話全体の要約（100文字程度）",
  "content": "ユーザーの気持ちや考えを整理した内容（300文字程度、箇条書きでも可）",
  "tags": ["キーワード1", "キーワード2", "キーワード3"]
}

タグは会話の主なテーマやキーワードを3〜5個程度抽出してください。`;

    const response = await client.chat.completions.create({
      model: config.llm.openai.model,
      messages: [
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    return {
      title: result.title || '今日の記録',
      summary: result.summary || '',
      content: result.content || '',
      tags: result.tags || [],
    };
  }

  /**
   * 会話履歴からジャーナルを生成（Anthropic）
   */
  private static async generateJournalWithAnthropic(
    conversationText: string
  ): Promise<JournalGenerationResult> {
    const client = this.getAnthropicClient();

    const prompt = `以下の会話履歴から、ユーザーの心の状態を整理したジャーナルエントリを生成してください。

会話履歴:
${conversationText}

以下のJSON形式で出力してください：
{
  "title": "今日の気持ちを表すタイトル（20文字以内）",
  "summary": "会話全体の要約（100文字程度）",
  "content": "ユーザーの気持ちや考えを整理した内容（300文字程度、箇条書きでも可）",
  "tags": ["キーワード1", "キーワード2", "キーワード3"]
}

タグは会話の主なテーマやキーワードを3〜5個程度抽出してください。
必ずJSON形式のみで返答してください。`;

    const response = await client.messages.create({
      model: config.llm.anthropic.model,
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt },
      ],
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '{}';

    // JSONを抽出（マークダウンコードブロックがある場合に対応）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;
    const result = JSON.parse(jsonText);

    return {
      title: result.title || '今日の記録',
      summary: result.summary || '',
      content: result.content || '',
      tags: result.tags || [],
    };
  }

  /**
   * セッション終了時にジャーナルエントリを生成
   */
  static async generateJournalFromSession(
    sessionId: string
  ): Promise<JournalEntry> {
    // セッション情報を取得
    const session = await SessionService.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // 会話履歴を取得
    const messages = await SessionService.getSessionMessages(sessionId);

    // 会話をテキストに変換
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'ユーザー' : 'AI'}: ${m.content}`)
      .join('\n\n');

    // ジャーナルを生成
    let journalData: JournalGenerationResult;
    if (config.llm.provider === 'anthropic') {
      journalData = await this.generateJournalWithAnthropic(conversationText);
    } else {
      journalData = await this.generateJournalWithOpenAI(conversationText);
    }

    // セッションにサマリーを保存
    await SessionService.setSummary(sessionId, journalData.summary);

    // ジャーナルエントリを作成
    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId: session.userId,
        title: journalData.title,
        content: journalData.content,
        tags: journalData.tags,
        date: session.startedAt,
      },
    });

    return journalEntry;
  }

  /**
   * ユーザーの全ジャーナルエントリを取得
   */
  static async getUserJournals(userId: string): Promise<JournalEntry[]> {
    return prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * 特定のジャーナルエントリを取得
   */
  static async getJournal(journalId: string): Promise<JournalEntry | null> {
    return prisma.journalEntry.findUnique({
      where: { id: journalId },
    });
  }
}
