import { MoodEntry } from '@prisma/client';
import prisma from '../lib/prisma';
import { eventBus } from '../lib/events';
import { recordMoodLogged } from '../lib/metrics';
import logger from '../lib/logger';

export interface CreateMoodEntryInput {
  userId: string;
  moodScore: number;
  emotions?: string[];
  notes?: string;
  triggers?: string[];
  activities?: string[];
}

export class MoodService {
  /**
   * Log a mood entry
   */
  static async logMood(input: CreateMoodEntryInput): Promise<MoodEntry> {
    // Validate mood score
    if (input.moodScore < 1 || input.moodScore > 10) {
      throw new Error('Mood score must be between 1 and 10');
    }

    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: input.userId,
        moodScore: input.moodScore,
        emotions: input.emotions || [],
        notes: input.notes,
        triggers: input.triggers || [],
        activities: input.activities || [],
      },
    });

    // Emit event
    await eventBus.emit({
      type: 'mood.logged',
      moodEntryId: moodEntry.id,
      userId: moodEntry.userId,
      moodScore: moodEntry.moodScore,
      timestamp: new Date(),
    });

    recordMoodLogged(moodEntry.moodScore);
    logger.info('Mood logged', {
      moodEntryId: moodEntry.id,
      userId: input.userId,
      score: input.moodScore,
    });

    return moodEntry;
  }

  /**
   * Get user's mood history
   */
  static async getUserMoods(
    userId: string,
    limit: number = 30
  ): Promise<MoodEntry[]> {
    return prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get mood statistics for a user
   */
  static async getMoodStats(userId: string, days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const moods = await prisma.moodEntry.findMany({
      where: {
        userId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (moods.length === 0) {
      return {
        average: null,
        min: null,
        max: null,
        trend: null,
        totalEntries: 0,
      };
    }

    const scores = moods.map(m => m.moodScore);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);

    // Calculate trend (positive = improving, negative = declining)
    const halfwayPoint = Math.floor(moods.length / 2);
    const firstHalf = moods.slice(0, halfwayPoint).map(m => m.moodScore);
    const secondHalf = moods.slice(halfwayPoint).map(m => m.moodScore);

    const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;
    const trend = secondAvg - firstAvg;

    return {
      average: Math.round(average * 10) / 10,
      min,
      max,
      trend: Math.round(trend * 10) / 10,
      totalEntries: moods.length,
    };
  }

  /**
   * Get most common emotions
   */
  static async getCommonEmotions(userId: string, limit: number = 10) {
    const moods = await prisma.moodEntry.findMany({
      where: { userId },
      select: { emotions: true },
    });

    const emotionCounts: Record<string, number> = {};
    moods.forEach(mood => {
      const emotions = mood.emotions as string[];
      emotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    return Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([emotion, count]) => ({ emotion, count }));
  }
}
