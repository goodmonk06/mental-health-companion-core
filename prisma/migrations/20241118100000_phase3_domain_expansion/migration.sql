-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE "GoalStatus" AS ENUM ('active', 'completed', 'abandoned', 'paused');
CREATE TYPE "ExerciseType" AS ENUM ('breathing', 'journaling', 'meditation', 'gratitude', 'cognitive_reframing', 'grounding', 'progressive_relaxation');
CREATE TYPE "ExerciseDifficulty" AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'sent', 'failed', 'cancelled');
CREATE TYPE "ActivityType" AS ENUM ('session_started', 'session_ended', 'message_sent', 'journal_created', 'goal_created', 'goal_updated', 'exercise_completed', 'mood_logged', 'safety_flag_raised');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'active',
                    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'ja',
    "therapyGoals" JSONB NOT NULL DEFAULT '[]',
    "focusAreas" JSONB NOT NULL DEFAULT '[]',
    "aiPersonality" TEXT NOT NULL DEFAULT 'empathetic',
    "notificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "reminderTime" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mood_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moodScore" INTEGER NOT NULL,
    "emotions" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "triggers" JSONB NOT NULL DEFAULT '[]',
    "activities" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_entries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "difficulty" "ExerciseDifficulty" NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "instructions" JSONB NOT NULL,
    "benefits" JSONB NOT NULL DEFAULT '[]',
    "tags" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exercise_completions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "rating" INTEGER,
    "feedback" TEXT,
    "durationMinutes" INTEGER,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_completions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "status" "GoalStatus" NOT NULL DEFAULT 'active',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "milestones" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "user_goals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "insights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "initialMessage" TEXT NOT NULL,
    "suggestedQuestions" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'pending',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");
CREATE INDEX "mood_entries_userId_idx" ON "mood_entries"("userId");
CREATE INDEX "mood_entries_createdAt_idx" ON "mood_entries"("createdAt");
CREATE INDEX "exercises_type_idx" ON "exercises"("type");
CREATE INDEX "exercises_difficulty_idx" ON "exercises"("difficulty");
CREATE INDEX "exercise_completions_userId_idx" ON "exercise_completions"("userId");
CREATE INDEX "exercise_completions_exerciseId_idx" ON "exercise_completions"("exerciseId");
CREATE INDEX "exercise_completions_completedAt_idx" ON "exercise_completions"("completedAt");
CREATE INDEX "user_goals_userId_idx" ON "user_goals"("userId");
CREATE INDEX "user_goals_status_idx" ON "user_goals"("status");
CREATE INDEX "insights_userId_idx" ON "insights"("userId");
CREATE INDEX "insights_isRead_idx" ON "insights"("isRead");
CREATE INDEX "insights_createdAt_idx" ON "insights"("createdAt");
CREATE UNIQUE INDEX "templates_name_key" ON "templates"("name");
CREATE INDEX "templates_category_idx" ON "templates"("category");
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_status_idx" ON "notifications"("status");
CREATE INDEX "notifications_scheduledFor_idx" ON "notifications"("scheduledFor");
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");
CREATE INDEX "activity_logs_type_idx" ON "activity_logs"("type");
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mood_entries" ADD CONSTRAINT "mood_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exercise_completions" ADD CONSTRAINT "exercise_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exercise_completions" ADD CONSTRAINT "exercise_completions_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "insights" ADD CONSTRAINT "insights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
