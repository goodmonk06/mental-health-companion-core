import { Router, Request, Response } from 'express';
import { SessionService } from '../services/session.service';
import { ChatService } from '../services/chat.service';
import { JournalService } from '../services/journal.service';
import { asyncHandler, validateBody } from './middleware';
import { startSessionSchema, endSessionSchema, chatSchema } from '../lib/validation';
import { NotFoundError } from '../lib/errors';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/**
 * セッション開始
 * POST /api/sessions/start
 */
router.post(
  '/sessions/start',
  validateBody(startSessionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId, moodTag } = req.body;
    const session = await SessionService.startSession({ userId, moodTag });

    res.json({
      success: true,
      session
    });
  })
);

/**
 * セッション終了
 * POST /api/sessions/:sessionId/end
 */
router.post(
  '/sessions/:sessionId/end',
  validateBody(endSessionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { generateJournal } = req.body;

    const session = await SessionService.endSession({ sessionId });

    let journal = null;
    if (generateJournal) {
      journal = await JournalService.generateJournalFromSession(sessionId);
    }

    res.json({
      success: true,
      session,
      journal
    });
  })
);

/**
 * セッション情報取得
 * GET /api/sessions/:sessionId
 */
router.get(
  '/sessions/:sessionId',
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const session = await SessionService.getSession(sessionId);

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    res.json({
      success: true,
      session
    });
  })
);

/**
 * ユーザーのセッション一覧取得
 * GET /api/users/:userId/sessions
 */
router.get(
  '/users/:userId/sessions',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const sessions = await SessionService.getUserSessions(userId);

    res.json({
      success: true,
      sessions
    });
  })
);

/**
 * チャット（メッセージ送信）
 * POST /api/chat
 */
router.post(
  '/chat',
  validateBody(chatSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId, message } = req.body;

    const result = await ChatService.chat({
      sessionId,
      userMessage: message,
    });

    res.json({
      success: true,
      ...result,
    });
  })
);

/**
 * ジャーナルエントリ一覧取得
 * GET /api/users/:userId/journals
 */
router.get(
  '/users/:userId/journals',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const journals = await JournalService.getUserJournals(userId);

    res.json({
      success: true,
      journals
    });
  })
);

/**
 * ジャーナルエントリ詳細取得
 * GET /api/journals/:journalId
 */
router.get(
  '/journals/:journalId',
  asyncHandler(async (req: Request, res: Response) => {
    const { journalId } = req.params;
    const journal = await JournalService.getJournal(journalId);

    if (!journal) {
      throw new NotFoundError('Journal not found');
    }

    res.json({
      success: true,
      journal
    });
  })
);

export default router;
