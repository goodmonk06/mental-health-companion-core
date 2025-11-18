import { PrismaClient, ExerciseType, ExerciseDifficulty, GoalStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Phase 3 comprehensive seed...');

  // ============================================================================
  // USERS & PROFILES (Multiple Personas)
  // ============================================================================

  const users = await Promise.all([
    // Persona 1: Anxious professional
    prisma.user.upsert({
      where: { id: 'user-anna-professional' },
      update: {},
      create: {
        id: 'user-anna-professional',
        externalId: 'anna@example.com',
        profile: {
          create: {
            displayName: 'Anna',
            timezone: 'Asia/Tokyo',
            preferredLanguage: 'ja',
            therapyGoals: ['不安管理', 'ワークライフバランス'],
            focusAreas: ['anxiety', 'stress', 'work_life_balance'],
            aiPersonality: 'empathetic',
            notificationEnabled: true,
            reminderTime: '20:00',
          },
        },
      },
    }),

    // Persona 2: Student with depression
    prisma.user.upsert({
      where: { id: 'user-ben-student' },
      update: {},
      create: {
        id: 'user-ben-student',
        externalId: 'ben@example.com',
        profile: {
          create: {
            displayName: 'Ben',
            timezone: 'America/New_York',
            preferredLanguage: 'en',
            therapyGoals: ['うつ病改善', '社会的つながり'],
            focusAreas: ['depression', 'social_connection', 'motivation'],
            aiPersonality: 'professional',
            notificationEnabled: true,
            reminderTime: '09:00',
          },
        },
      },
    }),

    // Persona 3: Parent managing stress
    prisma.user.upsert({
      where: { id: 'user-clara-parent' },
      update: {},
      create: {
        id: 'user-clara-parent',
        externalId: 'clara@example.com',
        profile: {
          create: {
            displayName: 'Clara',
            timezone: 'Europe/London',
            preferredLanguage: 'en',
            therapyGoals: ['ストレス管理', 'セルフケア'],
            focusAreas: ['stress', 'self_care', 'parenting'],
            aiPersonality: 'casual',
            notificationEnabled: false,
          },
        },
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users with profiles`);

  // ============================================================================
  // EXERCISES (Comprehensive Library)
  // ============================================================================

  const exercises = await Promise.all([
    // Breathing exercises
    prisma.exercise.create({
      data: {
        title: '4-7-8 呼吸法',
        description: 'リラックスと不安軽減のための呼吸テクニック',
        type: ExerciseType.breathing,
        difficulty: ExerciseDifficulty.beginner,
        durationMinutes: 5,
        instructions: [
          { step: 1, instruction: '楽な姿勢で座る' },
          { step: 2, instruction: '4秒かけて鼻から息を吸う' },
          { step: 3, instruction: '7秒間息を止める' },
          { step: 4, instruction: '8秒かけて口から息を吐く' },
          { step: 5, instruction: '4回繰り返す' },
        ],
        benefits: ['不安軽減', 'リラクゼーション', '睡眠改善'],
        tags: ['anxiety', 'relaxation', 'sleep'],
      },
    }),

    prisma.exercise.create({
      data: {
        title: 'ボックス呼吸',
        description: '集中力とストレス管理のための呼吸法',
        type: ExerciseType.breathing,
        difficulty: ExerciseDifficulty.beginner,
        durationMinutes: 3,
        instructions: [
          { step: 1, instruction: '4秒かけて息を吸う' },
          { step: 2, instruction: '4秒間息を止める' },
          { step: 3, instruction: '4秒かけて息を吐く' },
          { step: 4, instruction: '4秒間息を止める' },
          { step: 5, instruction: '数回繰り返す' },
        ],
        benefits: ['集中力向上', 'ストレス軽減'],
        tags: ['stress', 'focus'],
      },
    }),

    // Meditation exercises
    prisma.exercise.create({
      data: {
        title: 'マインドフルネス瞑想',
        description: '現在の瞬間に意識を向ける基本的な瞑想',
        type: ExerciseType.meditation,
        difficulty: ExerciseDifficulty.beginner,
        durationMinutes: 10,
        instructions: [
          { step: 1, instruction: '快適な姿勢で座る' },
          { step: 2, instruction: '呼吸に注意を向ける' },
          { step: 3, instruction: '思考が浮かんだら、優しく呼吸に戻す' },
          { step: 4, instruction: '10分間続ける' },
        ],
        benefits: ['ストレス軽減', '集中力向上', '感情調整'],
        tags: ['mindfulness', 'stress', 'focus'],
      },
    }),

    prisma.exercise.create({
      data: {
        title: 'ボディスキャン瞑想',
        description: '身体の各部分に意識を向ける瞑想',
        type: ExerciseType.meditation,
        difficulty: ExerciseDifficulty.intermediate,
        durationMinutes: 15,
        instructions: [
          { step: 1, instruction: '仰向けに寝る' },
          { step: 2, instruction: '足のつま先から始めて、身体の各部分に順番に注意を向ける' },
          { step: 3, instruction: '各部分の感覚を観察する' },
          { step: 4, instruction: '頭まで進んで終了' },
        ],
        benefits: ['リラクゼーション', '身体意識', 'ストレス軽減'],
        tags: ['relaxation', 'body_awareness'],
      },
    }),

    // Journaling exercises
    prisma.exercise.create({
      data: {
        title: '感謝ジャーナル',
        description: '毎日の感謝を記録する',
        type: ExerciseType.journaling,
        difficulty: ExerciseDifficulty.beginner,
        durationMinutes: 5,
        instructions: [
          { step: 1, instruction: '静かな場所を見つける' },
          { step: 2, instruction: '今日感謝したこと3つを書く' },
          { step: 3, instruction: 'なぜそれに感謝するのか考える' },
        ],
        benefits: ['ポジティブ思考', '幸福感向上'],
        tags: ['gratitude', 'positivity'],
      },
    }),

    prisma.exercise.create({
      data: {
        title: '思考記録',
        description: 'ネガティブな思考パターンを認識し、書き換える',
        type: ExerciseType.cognitive_reframing,
        difficulty: ExerciseDifficulty.intermediate,
        durationMinutes: 10,
        instructions: [
          { step: 1, instruction: 'ネガティブな思考を特定する' },
          { step: 2, instruction: 'その思考の証拠を探す' },
          { step: 3, instruction: '別の解釈を考える' },
          { step: 4, instruction: 'よりバランスの取れた思考を書く' },
        ],
        benefits: ['認知的柔軟性', 'ストレス軽減'],
        tags: ['cognitive', 'reframing'],
      },
    }),

    // Grounding exercises
    prisma.exercise.create({
      data: {
        title: '5-4-3-2-1 グラウンディング',
        description: '五感を使って現在の瞬間に戻る',
        type: ExerciseType.grounding,
        difficulty: ExerciseDifficulty.beginner,
        durationMinutes: 5,
        instructions: [
          { step: 1, instruction: '見えるもの5つに名前をつける' },
          { step: 2, instruction: '触れるもの4つに名前をつける' },
          { step: 3, instruction: '聞こえるもの3つに名前をつける' },
          { step: 4, instruction: '匂うもの2つに名前をつける' },
          { step: 5, instruction: '味わうもの1つに名前をつける' },
        ],
        benefits: ['不安軽減', '現在への集中'],
        tags: ['anxiety', 'grounding', 'panic'],
      },
    }),

    // Progressive relaxation
    prisma.exercise.create({
      data: {
        title: '漸進的筋弛緩法',
        description: '筋肉の緊張と弛緩を通じてリラックスする',
        type: ExerciseType.progressive_relaxation,
        difficulty: ExerciseDifficulty.beginner,
        durationMinutes: 15,
        instructions: [
          { step: 1, instruction: '快適に横になる' },
          { step: 2, instruction: '足から始めて、各筋肉群を5秒間緊張させる' },
          { step: 3, instruction: '緊張を解放し、違いを感じる' },
          { step: 4, instruction: '全身を通して繰り返す' },
        ],
        benefits: ['筋肉の緊張緩和', 'リラクゼーション', '睡眠改善'],
        tags: ['relaxation', 'tension', 'sleep'],
      },
    }),
  ]);

  console.log(`✅ Created ${exercises.length} exercises`);

  // ============================================================================
  // GOALS (Multiple goals for each user)
  // ============================================================================

  const goals = await Promise.all([
    // Anna's goals
    prisma.userGoal.create({
      data: {
        userId: 'user-anna-professional',
        title: '毎日10分の瞑想習慣',
        description: '朝の瞑想ルーティンを確立し、1日を穏やかに始める',
        category: 'anxiety_management',
        status: GoalStatus.active,
        progress: 60,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        milestones: [
          { title: '3日連続で瞑想する', completed: true },
          { title: '1週間継続する', completed: true },
          { title: '2週間継続する', completed: true },
          { title: '1ヶ月継続する', completed: false },
        ],
      },
    }),

    prisma.userGoal.create({
      data: {
        userId: 'user-anna-professional',
        title: '週3回の運動習慣',
        description: 'ストレス管理のための定期的な運動',
        category: 'stress_management',
        status: GoalStatus.active,
        progress: 40,
        milestones: [
          { title: '運動計画を立てる', completed: true },
          { title: '初めて運動する', completed: true },
          { title: '1週間継続', completed: false },
        ],
      },
    }),

    // Ben's goals
    prisma.userGoal.create({
      data: {
        userId: 'user-ben-student',
        title: '感謝ジャーナルを毎日書く',
        description: 'ポジティブな視点を養うために毎晩3つの感謝を記録',
        category: 'depression_management',
        status: GoalStatus.active,
        progress: 85,
        targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        milestones: [
          { title: '1週間継続', completed: true },
          { title: '2週間継続', completed: true },
          { title: '3週間継続', completed: false },
        ],
      },
    }),

    prisma.userGoal.create({
      data: {
        userId: 'user-ben-student',
        title: '友人と週1回会う',
        description: '社会的つながりを強化するために定期的な交流',
        category: 'social_connection',
        status: GoalStatus.active,
        progress: 25,
      },
    }),

    // Clara's goals
    prisma.userGoal.create({
      data: {
        userId: 'user-clara-parent',
        title: 'セルフケアの時間を毎日30分確保',
        description: '自分自身のための時間を優先する',
        category: 'self_care',
        status: GoalStatus.active,
        progress: 50,
        milestones: [
          { title: 'セルフケア活動リストを作る', completed: true },
          { title: '1週間実践する', completed: false },
        ],
      },
    }),

    // Completed goal example
    prisma.userGoal.create({
      data: {
        userId: 'user-anna-professional',
        title: '睡眠習慣の改善',
        description: '毎晩23時までに就寝する',
        category: 'sleep_improvement',
        status: GoalStatus.completed,
        progress: 100,
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        milestones: [
          { title: '就寝ルーティンを作る', completed: true },
          { title: '1週間継続', completed: true },
          { title: '2週間継続', completed: true },
        ],
      },
    }),
  ]);

  console.log(`✅ Created ${goals.length} goals`);

  // ============================================================================
  // MOOD ENTRIES (30 days of data for each user)
  // ============================================================================

  const moodEntries = [];
  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    date.setHours(20, 0, 0, 0);

    // Anna's moods (showing improvement trend)
    moodEntries.push(
      prisma.moodEntry.create({
        data: {
          userId: 'user-anna-professional',
          moodScore: Math.max(4, Math.min(8, 5 + Math.floor((30 - dayOffset) / 10))),
          emotions: dayOffset > 15 ? ['anxious', 'stressed'] : ['calm', 'hopeful'],
          notes: dayOffset > 20 ? '仕事のストレスが多い' : '少し楽になってきた',
          triggers: dayOffset > 15 ? ['work_deadline', 'lack_of_sleep'] : [],
          activities: ['meditation', 'journaling'],
          createdAt: date,
        },
      })
    );

    // Ben's moods (fluctuating)
    if (dayOffset < 25) {
      moodEntries.push(
        prisma.moodEntry.create({
          data: {
            userId: 'user-ben-student',
            moodScore: 3 + Math.floor(Math.random() * 5),
            emotions: ['sad', 'tired', 'lonely'],
            notes: Math.random() > 0.5 ? '少し良い日' : '辛い日',
            triggers: ['social_isolation', 'low_energy'],
            activities: ['studying', 'gaming'],
            createdAt: date,
          },
        })
      );
    }

    // Clara's moods (stable with occasional dips)
    if (dayOffset % 2 === 0) {
      moodEntries.push(
        prisma.moodEntry.create({
          data: {
            userId: 'user-clara-parent',
            moodScore: 6 + Math.floor(Math.random() * 3),
            emotions: ['content', 'grateful', 'tired'],
            notes: '家族との時間を楽しんでいる',
            activities: ['parenting', 'reading', 'exercise'],
            createdAt: date,
          },
        })
      );
    }
  }

  await Promise.all(moodEntries);
  console.log(`✅ Created ${moodEntries.length} mood entries`);

  // ============================================================================
  // EXERCISE COMPLETIONS
  // ============================================================================

  const completions = await Promise.all([
    // Anna completed breathing exercises
    prisma.exerciseCompletion.create({
      data: {
        userId: 'user-anna-professional',
        exerciseId: exercises[0].id,
        rating: 5,
        feedback: 'とても役に立ちました！',
        durationMinutes: 5,
        notes: '寝る前に実践して、よく眠れました',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),

    prisma.exerciseCompletion.create({
      data: {
        userId: 'user-anna-professional',
        exerciseId: exercises[2].id, // Mindfulness meditation
        rating: 4,
        durationMinutes: 10,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),

    // Ben completed journaling
    prisma.exerciseCompletion.create({
      data: {
        userId: 'user-ben-student',
        exerciseId: exercises[4].id, // Gratitude journal
        rating: 4,
        feedback: 'ポジティブに考えられるようになってきた',
        durationMinutes: 7,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),

    // Clara completed grounding
    prisma.exerciseCompletion.create({
      data: {
        userId: 'user-clara-parent',
        exerciseId: exercises[6].id, // 5-4-3-2-1 grounding
        rating: 5,
        feedback: '不安が強いときに本当に助かりました',
        durationMinutes: 5,
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Created ${completions.length} exercise completions`);

  // ============================================================================
  // INSIGHTS (AI-generated insights)
  // ============================================================================

  const insights = await Promise.all([
    prisma.insight.create({
      data: {
        userId: 'user-anna-professional',
        type: 'pattern',
        title: '気分改善のトレンド',
        content: '過去2週間で、あなたの気分スコアが平均1.5ポイント向上しています。瞑想と呼吸法の実践が効果を示している可能性があります。',
        priority: 5,
        isRead: false,
        metadata: {
          trend: 'improving',
          avgImprovement: 1.5,
          contributingFactors: ['meditation', 'breathing_exercises'],
        },
      },
    }),

    prisma.insight.create({
      data: {
        userId: 'user-anna-professional',
        type: 'milestone',
        title: '目標達成まであと少し！',
        content: '「毎日10分の瞑想習慣」があと12日で達成できます。現在の進捗率は60%です。',
        priority: 3,
        isRead: false,
        metadata: {
          goalId: goals[0].id,
          daysRemaining: 12,
          progress: 60,
        },
      },
    }),

    prisma.insight.create({
      data: {
        userId: 'user-ben-student',
        type: 'warning',
        title: '気分の変動に注意',
        content: '過去1週間で気分の変動が大きくなっています。必要に応じて専門家に相談することを検討してください。',
        priority: 8,
        isRead: false,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        metadata: {
          volatility: 'high',
          avgScore: 4.2,
        },
      },
    }),

    prisma.insight.create({
      data: {
        userId: 'user-clara-parent',
        type: 'improvement',
        title: 'セルフケアの効果',
        content: 'セルフケアの時間を確保した日は、気分スコアが平均1ポイント高くなっています。',
        priority: 4,
        isRead: true,
        metadata: {
          correlation: 'positive',
          impact: 1.0,
        },
      },
    }),
  ]);

  console.log(`✅ Created ${insights.length} insights`);

  console.log('\n🎉 Phase 3 comprehensive seed completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - ${users.length} users with detailed profiles`);
  console.log(`   - ${exercises.length} exercises across all types`);
  console.log(`   - ${goals.length} goals in various stages`);
  console.log(`   - ${moodEntries.length} mood entries (30 days of data)`);
  console.log(`   - ${completions.length} exercise completions`);
  console.log(`   - ${insights.length} AI-generated insights`);
  console.log(`   - Total: ${users.length + exercises.length + goals.length + moodEntries.length + completions.length + insights.length}+ records\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error during Phase 3 seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
