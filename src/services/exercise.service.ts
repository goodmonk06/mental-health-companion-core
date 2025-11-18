import { Exercise, ExerciseCompletion, ExerciseType, ExerciseDifficulty } from '@prisma/client';
import prisma from '../lib/prisma';
import { eventBus } from '../lib/events';
import { recordExerciseCompleted } from '../lib/metrics';
import logger from '../lib/logger';

export interface CreateExerciseInput {
  title: string;
  description: string;
  type: ExerciseType;
  difficulty: ExerciseDifficulty;
  durationMinutes: number;
  instructions: Array<{ step: number; instruction: string }>;
  benefits?: string[];
  tags?: string[];
}

export interface CompleteExerciseInput {
  userId: string;
  exerciseId: string;
  rating?: number;
  feedback?: string;
  durationMinutes?: number;
  notes?: string;
}

export class ExerciseService {
  /**
   * Create a new exercise
   */
  static async createExercise(input: CreateExerciseInput): Promise<Exercise> {
    const exercise = await prisma.exercise.create({
      data: {
        title: input.title,
        description: input.description,
        type: input.type,
        difficulty: input.difficulty,
        durationMinutes: input.durationMinutes,
        instructions: input.instructions,
        benefits: input.benefits || [],
        tags: input.tags || [],
      },
    });

    logger.info('Exercise created', { exerciseId: exercise.id, type: exercise.type });

    return exercise;
  }

  /**
   * Get all active exercises
   */
  static async getExercises(
    type?: ExerciseType,
    difficulty?: ExerciseDifficulty
  ): Promise<Exercise[]> {
    return prisma.exercise.findMany({
      where: {
        isActive: true,
        ...(type && { type }),
        ...(difficulty && { difficulty }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single exercise
   */
  static async getExercise(exerciseId: string): Promise<Exercise | null> {
    return prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        completions: {
          take: 10,
          orderBy: { completedAt: 'desc' },
        },
      },
    });
  }

  /**
   * Record exercise completion
   */
  static async completeExercise(input: CompleteExerciseInput): Promise<ExerciseCompletion> {
    const exercise = await prisma.exercise.findUnique({
      where: { id: input.exerciseId },
    });

    if (!exercise) {
      throw new Error('Exercise not found');
    }

    const completion = await prisma.exerciseCompletion.create({
      data: {
        userId: input.userId,
        exerciseId: input.exerciseId,
        rating: input.rating,
        feedback: input.feedback,
        durationMinutes: input.durationMinutes,
        notes: input.notes,
      },
    });

    // Emit event
    await eventBus.emit({
      type: 'exercise.completed',
      completionId: completion.id,
      userId: completion.userId,
      exerciseId: completion.exerciseId,
      exerciseType: exercise.type,
      timestamp: new Date(),
    });

    recordExerciseCompleted(exercise.type);
    logger.info('Exercise completed', {
      completionId: completion.id,
      userId: input.userId,
      exerciseType: exercise.type,
    });

    return completion;
  }

  /**
   * Get user's exercise history
   */
  static async getUserCompletions(userId: string): Promise<ExerciseCompletion[]> {
    return prisma.exerciseCompletion.findMany({
      where: { userId },
      include: { exercise: true },
      orderBy: { completedAt: 'desc' },
    });
  }

  /**
   * Get exercise statistics for a user
   */
  static async getUserExerciseStats(userId: string) {
    const completions = await prisma.exerciseCompletion.findMany({
      where: { userId },
      include: { exercise: true },
    });

    const totalCompleted = completions.length;
    const totalMinutes = completions.reduce((sum, c) => sum + (c.durationMinutes || c.exercise.durationMinutes), 0);

    const byType = completions.reduce((acc, c) => {
      acc[c.exercise.type] = (acc[c.exercise.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgRating = completions
      .filter(c => c.rating !== null)
      .reduce((sum, c, _, arr) => sum + (c.rating || 0) / arr.length, 0);

    return {
      totalCompleted,
      totalMinutes,
      byType,
      avgRating: avgRating || null,
    };
  }
}
