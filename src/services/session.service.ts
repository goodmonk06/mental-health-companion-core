import { Session, Message } from '@prisma/client';
import prisma from '../lib/prisma';
import { SessionStartParams, SessionEndParams } from '../types';

export class SessionService {
  /**
   * 新しいセッションを開始
   */
  static async startSession(params: SessionStartParams): Promise<Session> {
    const { userId, moodTag } = params;

    // ユーザーが存在しない場合は作成
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    // 新しいセッションを作成
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        moodTag,
        startedAt: new Date(),
      },
    });

    return session;
  }

  /**
   * セッションを終了
   */
  static async endSession(params: SessionEndParams): Promise<Session> {
    const { sessionId } = params;

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
      },
      include: {
        messages: true,
      },
    });

    return session;
  }

  /**
   * セッションにメッセージを追加
   */
  static async addMessage(
    sessionId: string,
    role: 'user' | 'ai',
    content: string
  ): Promise<Message> {
    const message = await prisma.message.create({
      data: {
        sessionId,
        role,
        content,
      },
    });

    return message;
  }

  /**
   * セッションの全メッセージを取得
   */
  static async getSessionMessages(sessionId: string): Promise<Message[]> {
    return prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * セッションを取得
   */
  static async getSession(sessionId: string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        messages: true,
        safetyFlags: true,
      },
    });
  }

  /**
   * ユーザーの全セッションを取得
   */
  static async getUserSessions(userId: string): Promise<Session[]> {
    return prisma.session.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        messages: true,
      },
    });
  }

  /**
   * セッションにサマリーを設定
   */
  static async setSummary(
    sessionId: string,
    summary: string
  ): Promise<Session> {
    return prisma.session.update({
      where: { id: sessionId },
      data: { summary },
    });
  }
}
