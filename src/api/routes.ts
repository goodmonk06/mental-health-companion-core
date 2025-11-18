import { Router, Request, Response } from 'express';
import { SessionService } from '../services/session.service';
import { ChatService } from '../services/chat.service';
import { JournalService } from '../services/journal.service';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * セッション開始
 * POST /api/sessions/start
 */
router.post('/sessions/start', async (req: Request, res: Response) => {
  try {
    const { userId, moodTag } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const session = await SessionService.startSession({ userId, moodTag });
    res.json({ session });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

/**
 * セッション終了
 * POST /api/sessions/:sessionId/end
 */
router.post('/sessions/:sessionId/end', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { generateJournal = true } = req.body;

    const session = await SessionService.endSession({ sessionId });

    let journal = null;
    if (generateJournal) {
      journal = await JournalService.generateJournalFromSession(sessionId);
    }

    res.json({ session, journal });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

/**
 * セッション情報取得
 * GET /api/sessions/:sessionId
 */
router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await SessionService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

/**
 * ユーザーのセッション一覧取得
 * GET /api/users/:userId/sessions
 */
router.get('/users/:userId/sessions', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const sessions = await SessionService.getUserSessions(userId);
    res.json({ sessions });
  } catch (error) {
    console.error('Error getting user sessions:', error);
    res.status(500).json({ error: 'Failed to get user sessions' });
  }
});

/**
 * チャット（メッセージ送信）
 * POST /api/chat
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        error: 'sessionId and message are required',
      });
    }

    const result = await ChatService.chat({
      sessionId,
      userMessage: message,
    });

    res.json(result);
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

/**
 * ジャーナルエントリ一覧取得
 * GET /api/users/:userId/journals
 */
router.get('/users/:userId/journals', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const journals = await JournalService.getUserJournals(userId);
    res.json({ journals });
  } catch (error) {
    console.error('Error getting journals:', error);
    res.status(500).json({ error: 'Failed to get journals' });
  }
});

/**
 * ジャーナルエントリ詳細取得
 * GET /api/journals/:journalId
 */
router.get('/journals/:journalId', async (req: Request, res: Response) => {
  try {
    const { journalId } = req.params;
    const journal = await JournalService.getJournal(journalId);

    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    res.json({ journal });
  } catch (error) {
    console.error('Error getting journal:', error);
    res.status(500).json({ error: 'Failed to get journal' });
  }
});

export default router;
