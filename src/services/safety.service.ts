import { SafetyCheckResult } from '../types';
import { SafetySeverity } from '@prisma/client';
import prisma from '../lib/prisma';

// 自傷・危機的なキーワードのリスト（プリミティブな実装）
const SAFETY_KEYWORDS = {
  critical: [
    '自殺',
    '死にたい',
    '消えたい',
    '死のう',
    '首を吊',
    '飛び降り',
  ],
  high: [
    '自傷',
    'リストカット',
    '傷つけ',
    '痛みつけ',
  ],
  medium: [
    'つらい',
    '苦しい',
    '辛い',
    '助けて',
  ],
};

export class SafetyService {
  /**
   * テキスト内容の安全性をチェック
   */
  static checkContent(content: string): SafetyCheckResult {
    const flags: SafetyCheckResult['flags'] = [];

    // Critical keywords
    for (const keyword of SAFETY_KEYWORDS.critical) {
      if (content.includes(keyword)) {
        flags.push({
          type: 'self_harm',
          keyword,
          severity: 'critical',
        });
      }
    }

    // High severity keywords
    for (const keyword of SAFETY_KEYWORDS.high) {
      if (content.includes(keyword)) {
        flags.push({
          type: 'self_harm',
          keyword,
          severity: 'high',
        });
      }
    }

    // Medium severity keywords
    for (const keyword of SAFETY_KEYWORDS.medium) {
      if (content.includes(keyword)) {
        flags.push({
          type: 'distress',
          keyword,
          severity: 'medium',
        });
      }
    }

    return {
      isSafe: flags.length === 0 || !flags.some(f => f.severity === 'critical'),
      flags,
    };
  }

  /**
   * セッションに安全フラグを記録
   */
  static async recordSafetyFlags(
    sessionId: string,
    checkResult: SafetyCheckResult
  ): Promise<void> {
    if (checkResult.flags.length === 0) {
      return;
    }

    // データベースにフラグを保存
    await Promise.all(
      checkResult.flags.map(flag =>
        prisma.safetyFlag.create({
          data: {
            sessionId,
            flagType: flag.type,
            keyword: flag.keyword,
            severity: flag.severity.toUpperCase() as SafetySeverity,
          },
        })
      )
    );
  }

  /**
   * セッションの安全フラグを取得
   */
  static async getSessionSafetyFlags(sessionId: string) {
    return prisma.safetyFlag.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * クライシスレスポンスメッセージを生成
   */
  static getCrisisResponse(): string {
    return `
大変な状況にあるようですね。あなたの気持ちを大切に受け止めています。

もし今すぐ誰かに話したい場合は、以下の専門機関にご相談ください：

• いのちの電話: 0570-783-556（ナビダイヤル）
• こころの健康相談統一ダイヤル: 0570-064-556
• よりそいホットライン: 0120-279-338

このシステムは医療行為ではなく、専門的なサポートを提供することはできません。
あなたの安全のために、専門家への相談を強くお勧めします。
    `.trim();
  }
}
