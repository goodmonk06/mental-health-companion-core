import { Router, Request, Response } from 'express';
import { asyncHandler, validateBody } from './middleware';
import { GoalService } from '../services/goal.service';
import { ExerciseService } from '../services/exercise.service';
import { MoodService } from '../services/mood.service';
import { NotFoundError } from '../lib/errors';
import { z } from 'zod';

const router = Router();

// ============================================================================
// GOAL ROUTES (Vertical Slice #2)
// ============================================================================

const createGoalSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string(),
  category: z.string(),
  targetDate: z.string().datetime().optional(),
  milestones: z.array(z.object({
    title: z.string(),
    completed: z.boolean(),
  })).optional(),
});

const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'abandoned', 'paused']).optional(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

/**
 * Create a new goal
 * POST /api/v2/goals
 */
router.post(
  '/goals',
  validateBody(createGoalSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { targetDate, ...rest } = req.body;
    const goal = await GoalService.createGoal({
      ...rest,
      targetDate: targetDate ? new Date(targetDate) : undefined,
    });

    res.status(201).json({
      success: true,
      goal,
    });
  })
);

/**
 * Get user's goals
 * GET /api/v2/users/:userId/goals
 */
router.get(
  '/users/:userId/goals',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { status } = req.query;

    const goals = await GoalService.getUserGoals(
      userId,
      status as any
    );

    res.json({
      success: true,
      goals,
    });
  })
);

/**
 * Get single goal
 * GET /api/v2/goals/:goalId
 */
router.get(
  '/goals/:goalId',
  asyncHandler(async (req: Request, res: Response) => {
    const { goalId } = req.params;
    const goal = await GoalService.getGoal(goalId);

    if (!goal) {
      throw new NotFoundError('Goal not found');
    }

    res.json({
      success: true,
      goal,
    });
  })
);

/**
 * Update goal
 * PATCH /api/v2/goals/:goalId
 */
router.patch(
  '/goals/:goalId',
  validateBody(updateGoalSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { goalId } = req.params;
    const goal = await GoalService.updateGoal(goalId, req.body);

    res.json({
      success: true,
      goal,
    });
  })
);

/**
 * Update goal progress
 * POST /api/v2/goals/:goalId/progress
 */
router.post(
  '/goals/:goalId/progress',
  validateBody(z.object({ progress: z.number().min(0).max(100) })),
  asyncHandler(async (req: Request, res: Response) => {
    const { goalId } = req.params;
    const { progress } = req.body;

    const goal = await GoalService.updateProgress(goalId, progress);

    res.json({
      success: true,
      goal,
    });
  })
);

/**
 * Delete goal
 * DELETE /api/v2/goals/:goalId
 */
router.delete(
  '/goals/:goalId',
  asyncHandler(async (req: Request, res: Response) => {
    const { goalId } = req.params;
    await GoalService.deleteGoal(goalId);

    res.json({
      success: true,
      message: 'Goal deleted',
    });
  })
);

// ============================================================================
// EXERCISE ROUTES (Vertical Slice #3)
// ============================================================================

const completeExerciseSchema = z.object({
  userId: z.string(),
  exerciseId: z.string(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional(),
  durationMinutes: z.number().positive().optional(),
  notes: z.string().optional(),
});

/**
 * Get all exercises
 * GET /api/v2/exercises
 */
router.get(
  '/exercises',
  asyncHandler(async (req: Request, res: Response) => {
    const { type, difficulty } = req.query;

    const exercises = await ExerciseService.getExercises(
      type as any,
      difficulty as any
    );

    res.json({
      success: true,
      exercises,
    });
  })
);

/**
 * Get single exercise
 * GET /api/v2/exercises/:exerciseId
 */
router.get(
  '/exercises/:exerciseId',
  asyncHandler(async (req: Request, res: Response) => {
    const { exerciseId } = req.params;
    const exercise = await ExerciseService.getExercise(exerciseId);

    if (!exercise) {
      throw new NotFoundError('Exercise not found');
    }

    res.json({
      success: true,
      exercise,
    });
  })
);

/**
 * Complete an exercise
 * POST /api/v2/exercises/complete
 */
router.post(
  '/exercises/complete',
  validateBody(completeExerciseSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const completion = await ExerciseService.completeExercise(req.body);

    res.status(201).json({
      success: true,
      completion,
    });
  })
);

/**
 * Get user's exercise history
 * GET /api/v2/users/:userId/exercises/history
 */
router.get(
  '/users/:userId/exercises/history',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const completions = await ExerciseService.getUserCompletions(userId);

    res.json({
      success: true,
      completions,
    });
  })
);

/**
 * Get user's exercise statistics
 * GET /api/v2/users/:userId/exercises/stats
 */
router.get(
  '/users/:userId/exercises/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const stats = await ExerciseService.getUserExerciseStats(userId);

    res.json({
      success: true,
      stats,
    });
  })
);

// ============================================================================
// MOOD ROUTES (Vertical Slice #4)
// ============================================================================

const logMoodSchema = z.object({
  userId: z.string(),
  moodScore: z.number().min(1).max(10),
  emotions: z.array(z.string()).optional(),
  notes: z.string().optional(),
  triggers: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
});

/**
 * Log a mood entry
 * POST /api/v2/moods
 */
router.post(
  '/moods',
  validateBody(logMoodSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const moodEntry = await MoodService.logMood(req.body);

    res.status(201).json({
      success: true,
      moodEntry,
    });
  })
);

/**
 * Get user's mood history
 * GET /api/v2/users/:userId/moods
 */
router.get(
  '/users/:userId/moods',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { limit } = req.query;

    const moods = await MoodService.getUserMoods(
      userId,
      limit ? parseInt(limit as string) : 30
    );

    res.json({
      success: true,
      moods,
    });
  })
);

/**
 * Get mood statistics
 * GET /api/v2/users/:userId/moods/stats
 */
router.get(
  '/users/:userId/moods/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { days } = req.query;

    const stats = await MoodService.getMoodStats(
      userId,
      days ? parseInt(days as string) : 30
    );

    res.json({
      success: true,
      stats,
    });
  })
);

/**
 * Get common emotions
 * GET /api/v2/users/:userId/moods/emotions
 */
router.get(
  '/users/:userId/moods/emotions',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { limit } = req.query;

    const emotions = await MoodService.getCommonEmotions(
      userId,
      limit ? parseInt(limit as string) : 10
    );

    res.json({
      success: true,
      emotions,
    });
  })
);

export default router;
