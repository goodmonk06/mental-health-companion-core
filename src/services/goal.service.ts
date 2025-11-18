import { UserGoal, GoalStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { eventBus } from '../lib/events';
import { recordGoalCreated } from '../lib/metrics';
import logger from '../lib/logger';

export interface CreateGoalInput {
  userId: string;
  title: string;
  description: string;
  category: string;
  targetDate?: Date;
  milestones?: Array<{ title: string; completed: boolean }>;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  status?: GoalStatus;
  progress?: number;
  notes?: string;
  targetDate?: Date;
  milestones?: Array<{ title: string; completed: boolean }>;
}

export class GoalService {
  /**
   * Create a new goal
   */
  static async createGoal(input: CreateGoalInput): Promise<UserGoal> {
    const goal = await prisma.userGoal.create({
      data: {
        userId: input.userId,
        title: input.title,
        description: input.description,
        category: input.category,
        targetDate: input.targetDate,
        milestones: input.milestones || [],
      },
    });

    // Emit event
    await eventBus.emit({
      type: 'goal.created',
      goalId: goal.id,
      userId: goal.userId,
      category: goal.category,
      timestamp: new Date(),
    });

    recordGoalCreated();
    logger.info('Goal created', { goalId: goal.id, userId: goal.userId });

    return goal;
  }

  /**
   * Update goal
   */
  static async updateGoal(goalId: string, input: UpdateGoalInput): Promise<UserGoal> {
    const goal = await prisma.userGoal.update({
      where: { id: goalId },
      data: {
        ...input,
        completedAt: input.status === 'completed' ? new Date() : undefined,
      },
    });

    // Emit event
    await eventBus.emit({
      type: 'goal.updated',
      goalId: goal.id,
      userId: goal.userId,
      status: goal.status,
      progress: goal.progress,
      timestamp: new Date(),
    });

    logger.info('Goal updated', { goalId: goal.id, status: goal.status });

    return goal;
  }

  /**
   * Get user goals
   */
  static async getUserGoals(
    userId: string,
    status?: GoalStatus
  ): Promise<UserGoal[]> {
    return prisma.userGoal.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single goal
   */
  static async getGoal(goalId: string): Promise<UserGoal | null> {
    return prisma.userGoal.findUnique({
      where: { id: goalId },
    });
  }

  /**
   * Update goal progress
   */
  static async updateProgress(goalId: string, progress: number): Promise<UserGoal> {
    const goal = await prisma.userGoal.update({
      where: { id: goalId },
      data: {
        progress: Math.min(100, Math.max(0, progress)),
        ...(progress >= 100 && {
          status: 'completed',
          completedAt: new Date(),
        }),
      },
    });

    logger.info('Goal progress updated', { goalId, progress: goal.progress });

    return goal;
  }

  /**
   * Delete goal
   */
  static async deleteGoal(goalId: string): Promise<void> {
    await prisma.userGoal.delete({
      where: { id: goalId },
    });

    logger.info('Goal deleted', { goalId });
  }
}
