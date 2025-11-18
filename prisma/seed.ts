import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { id: 'demo-user-1' },
    update: {},
    create: {
      id: 'demo-user-1',
      externalId: 'demo@example.com',
    },
  });

  console.log('✅ Created demo user:', demoUser.id);

  // Create a completed session with messages
  const session1 = await prisma.session.create({
    data: {
      userId: demoUser.id,
      startedAt: new Date('2024-11-17T10:00:00Z'),
      endedAt: new Date('2024-11-17T10:30:00Z'),
      moodTag: '穏やか',
      summary: 'ユーザーは最近の仕事のストレスについて話し、趣味の時間を持つことの重要性を再認識しました。',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        sessionId: session1.id,
        role: 'user',
        content: '最近仕事が忙しくて、少し疲れています。',
        createdAt: new Date('2024-11-17T10:00:00Z'),
      },
      {
        sessionId: session1.id,
        role: 'ai',
        content: 'お疲れのようですね。仕事が忙しいとのこと、心身ともに負担がかかっているかもしれませんね。どのような点が特に大変だと感じていますか？',
        createdAt: new Date('2024-11-17T10:02:00Z'),
      },
      {
        sessionId: session1.id,
        role: 'user',
        content: '締切が近いプロジェクトが複数あって、時間が足りない感じです。でも、自分の趣味の時間も大切にしたいんです。',
        createdAt: new Date('2024-11-17T10:05:00Z'),
      },
      {
        sessionId: session1.id,
        role: 'ai',
        content: '趣味の時間を大切にしたいというお気持ち、とても素晴らしいことだと思います。忙しい中でも、自分のための時間を意識的に確保することは、長期的にはより良いパフォーマンスにもつながります。小さな時間でも趣味に触れることはできそうですか？',
        createdAt: new Date('2024-11-17T10:08:00Z'),
      },
      {
        sessionId: session1.id,
        role: 'user',
        content: 'そうですね。週末に少しでも時間を取ってみようと思います。ありがとうございます。',
        createdAt: new Date('2024-11-17T10:10:00Z'),
      },
    ],
  });

  console.log('✅ Created session 1 with messages');

  // Create a journal entry
  await prisma.journalEntry.create({
    data: {
      userId: demoUser.id,
      date: new Date('2024-11-17T10:30:00Z'),
      title: '仕事と趣味のバランス',
      content: `今日は仕事の忙しさと趣味の時間のバランスについて考えました。

締切が近いプロジェクトが複数あり、時間的なプレッシャーを感じていますが、自分の趣味の時間も大切にしたいという気持ちがあります。

対話を通じて、小さな時間でも趣味に触れることの重要性を再認識しました。週末に少しでも趣味の時間を確保することを決意しました。

心の健康のためには、仕事だけでなく、自分が楽しめることにも意識的に時間を割くことが必要だと感じています。`,
      tags: ['仕事', 'ストレス', '趣味', 'バランス', 'セルフケア'],
    },
  });

  console.log('✅ Created journal entry');

  // Create another ongoing session
  const session2 = await prisma.session.create({
    data: {
      userId: demoUser.id,
      startedAt: new Date('2024-11-18T14:00:00Z'),
      moodTag: '前向き',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        sessionId: session2.id,
        role: 'user',
        content: '今日は良い天気ですね。気分も良いです。',
        createdAt: new Date('2024-11-18T14:00:00Z'),
      },
      {
        sessionId: session2.id,
        role: 'ai',
        content: '良い天気の日は気分も明るくなりますよね。今日はどんなことをして過ごされる予定ですか？',
        createdAt: new Date('2024-11-18T14:01:00Z'),
      },
    ],
  });

  console.log('✅ Created session 2 (ongoing)');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
