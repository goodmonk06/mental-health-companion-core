# Mental Health Companion Core

メンタルヘルスAIコンパニオンのコアバックエンドシステム。セッション管理、安全チェック、ジャーナル生成機能を提供します。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-brightgreen)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

## ⚠️ 重要な免責事項

**このシステムは医療行為ではありません。**

- 本システムは技術的な実装例であり、教育・研究目的で開発されています
- 医学的診断、治療、カウンセリングを提供するものではありません
- メンタルヘルスに関する専門的なサポートが必要な場合は、必ず医療機関や専門家にご相談ください
- 緊急時や危機的状況では、適切な専門機関（いのちの電話、救急サービスなど）に連絡してください

## 📋 Overview

このプロジェクトは、メンタルヘルスサポートのためのAIコンパニオンシステムのコアバックエンドです。ユーザーとの対話セッションを管理し、安全性をチェックし、会話から自動的にジャーナルエントリを生成します。

### 主な特徴

- **セッション管理**: ユーザーとの対話セッションのライフサイクル管理
- **AIチャット**: OpenAI GPT / Anthropic Claude による共感的な対話
- **セーフティチェック**: 自傷関連キーワードの自動検出と危機介入
- **ジャーナル生成**: LLMによる会話の自動サマリーと記録
- **型安全性**: TypeScript + Zod による完全な型安全性
- **テスト**: Vitest によるユニットテスト

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 20 + TypeScript 5.3 |
| Database | PostgreSQL 16 + Prisma ORM 5.22 |
| API | RESTful API (Express 4.x) |
| LLM | OpenAI GPT-4 / Anthropic Claude 3.5 |
| Validation | Zod 3.x |
| Testing | Vitest 1.x |
| Containerization | Docker + Docker Compose |

## 📐 Domain Model

```
User (ユーザー)
  ├─ Session (セッション) *多
  │   ├─ Message (メッセージ) *多
  │   └─ SafetyFlag (安全フラグ) *多
  └─ JournalEntry (ジャーナルエントリ) *多
```

### エンティティの関係

- **User**: システムを利用するユーザー
- **Session**: ユーザーとAIの対話セッション（開始〜終了）
- **Message**: セッション内の個々のメッセージ（ユーザーまたはAI）
- **JournalEntry**: セッション終了時に生成される自動記録
- **SafetyFlag**: メッセージ内で検出された安全に関するフラグ

## 🚀 Getting Started

### Requirements

- Node.js 20以上
- PostgreSQL 16以上（またはDocker）
- OpenAI API Key または Anthropic API Key

### Option 1: Docker Compose（推奨）

最も簡単な方法です。Docker ComposeでPostgreSQLとアプリケーションを同時に起動します。

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd mental-health-companion-core

# 2. 環境変数を設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定

# 3. Docker Composeで起動
npm run docker:up

# ログを確認
npm run docker:logs

# 停止
npm run docker:down
```

アプリケーションは `http://localhost:3000` で起動します。

### Option 2: ローカル開発環境

PostgreSQLを別途用意する場合の手順です。

```bash
# 1. 依存関係のインストール
npm install

# 2. 環境変数を設定
cp .env.example .env
# .envファイルを編集
# - DATABASE_URL: PostgreSQL接続文字列
# - LLM_PROVIDER: openai または anthropic
# - OPENAI_API_KEY または ANTHROPIC_API_KEY

# 3. データベースのセットアップ
npm run db:generate  # Prisma Clientを生成
npm run db:push      # スキーマをデータベースに適用
npm run db:seed      # デモデータを投入

# 4. 開発サーバーを起動
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

### 🎯 クイックセットアップ（ワンコマンド）

```bash
npm run setup
```

このコマンドは以下を自動実行します：
1. 依存関係のインストール
2. Prisma Clientの生成
3. データベーススキーマの適用
4. シードデータの投入

## 🌟 Example Flow（垂直スライス）

以下は、実装済みの完全なエンドツーエンドフローです。

### 1. セッション開始

```bash
curl -X POST http://localhost:3000/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo-user-1",
    "moodTag": "穏やか"
  }'
```

レスポンス例：
```json
{
  "success": true,
  "session": {
    "id": "clxxxxxxx",
    "userId": "demo-user-1",
    "startedAt": "2024-11-18T...",
    "moodTag": "穏やか"
  }
}
```

### 2. チャット（メッセージ送信）

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "clxxxxxxx",
    "message": "今日は少し疲れています"
  }'
```

レスポンス例：
```json
{
  "success": true,
  "aiResponse": "お疲れのようですね。どのようなことがあったか、よろしければ聞かせていただけますか？",
  "safetyWarning": null
}
```

### 3. セッション終了とジャーナル生成

```bash
curl -X POST http://localhost:3000/api/sessions/clxxxxxxx/end \
  -H "Content-Type: application/json" \
  -d '{
    "generateJournal": true
  }'
```

レスポンス例：
```json
{
  "success": true,
  "session": {
    "id": "clxxxxxxx",
    "endedAt": "2024-11-18T...",
    "summary": "ユーザーは今日の疲労について話し..."
  },
  "journal": {
    "id": "clyyyyyyy",
    "title": "今日の振り返り",
    "content": "...",
    "tags": ["疲労", "仕事", "ストレス"]
  }
}
```

### 4. ジャーナル一覧の取得

```bash
curl http://localhost:3000/api/users/demo-user-1/journals
```

### デモユーザー

シードデータには以下のデモユーザーが含まれています：

- **User ID**: `demo-user-1`
- **Email**: `demo@example.com`
- 既存のセッションとジャーナルエントリがあります

## 📡 API Endpoints

### Health Check

```
GET /api/health
```

### Session Management

```
POST   /api/sessions/start          # セッション開始
POST   /api/sessions/:id/end        # セッション終了
GET    /api/sessions/:id            # セッション詳細
GET    /api/users/:userId/sessions  # ユーザーのセッション一覧
```

### Chat

```
POST   /api/chat                    # メッセージ送信
```

### Journal

```
GET    /api/users/:userId/journals  # ユーザーのジャーナル一覧
GET    /api/journals/:id            # ジャーナル詳細
```

詳細なAPIドキュメントは各エンドポイントのコード内コメントを参照してください。

## 🏗️ Architecture

```
src/
├── api/                    # REST APIレイヤー
│   ├── routes.ts           # ルート定義
│   └── middleware.ts       # バリデーション、エラーハンドリング
├── services/               # ビジネスロジック層
│   ├── session.service.ts  # セッション管理
│   ├── chat.service.ts     # AIチャット
│   ├── journal.service.ts  # ジャーナル生成
│   └── safety.service.ts   # セーフティチェック
├── lib/                    # 共通ライブラリ
│   ├── prisma.ts           # Prismaクライアント
│   ├── validation.ts       # Zodスキーマ
│   └── errors.ts           # カスタムエラークラス
├── types/                  # TypeScript型定義
│   └── index.ts
├── config/                 # 設定管理
│   └── index.ts
└── index.ts                # エントリーポイント
```

## 🧪 Testing

```bash
# テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジレポート
npm run test:coverage
```

テストファイルは `src/__tests__/` に配置されています。

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | TypeScriptをビルド |
| `npm start` | 本番サーバー起動 |
| `npm test` | テスト実行 |
| `npm run test:watch` | テストをウォッチモードで実行 |
| `npm run test:coverage` | カバレッジレポート生成 |
| `npm run lint` | ESLintでコードチェック |
| `npm run lint:fix` | ESLintで自動修正 |
| `npm run type-check` | TypeScriptの型チェック |
| `npm run db:generate` | Prisma Clientを生成 |
| `npm run db:migrate` | マイグレーション実行 |
| `npm run db:push` | スキーマをDBに適用（開発用） |
| `npm run db:seed` | シードデータを投入 |
| `npm run db:studio` | Prisma Studioを起動 |
| `npm run db:reset` | DBをリセット |
| `npm run docker:up` | Docker Composeで起動 |
| `npm run docker:down` | Docker Composeを停止 |
| `npm run docker:logs` | アプリのログを表示 |
| `npm run setup` | 初回セットアップ（一括実行） |

## 🔒 Safety Features

システムは3段階のセーフティチェックを実装しています：

| Severity | Keywords | Action |
|----------|----------|--------|
| **Critical** | 自殺、死にたい、飛び降り 等 | 即座に専門機関への相談を促す |
| **High** | 自傷、リストカット 等 | フラグを記録し、注意を促す |
| **Medium** | つらい、苦しい、助けて 等 | フラグを記録（参考情報） |

危機的なキーワードが検出された場合、以下の情報を含むメッセージを返します：
- いのちの電話: 0570-783-556
- こころの健康相談統一ダイヤル: 0570-064-556
- よりそいホットライン: 0120-279-338

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL接続文字列 | ✓ | - |
| `LLM_PROVIDER` | LLMプロバイダー (`openai` / `anthropic`) | ✓ | `openai` |
| `OPENAI_API_KEY` | OpenAI APIキー | * | - |
| `OPENAI_MODEL` | 使用するOpenAIモデル | - | `gpt-4-turbo-preview` |
| `ANTHROPIC_API_KEY` | Anthropic APIキー | * | - |
| `ANTHROPIC_MODEL` | 使用するAnthropicモデル | - | `claude-3-5-sonnet-20241022` |
| `PORT` | サーバーポート番号 | - | `3000` |
| `NODE_ENV` | 実行環境 | - | `development` |
| `ENABLE_SAFETY_CHECKS` | セーフティチェック有効化 | - | `true` |

\* `LLM_PROVIDER` に応じて、どちらか一方が必須

## 📝 Database Schema

```prisma
model User {
  id             String         @id @default(cuid())
  externalId     String?        @unique
  createdAt      DateTime       @default(now())
  sessions       Session[]
  journalEntries JournalEntry[]
}

model Session {
  id          String        @id @default(cuid())
  userId      String
  startedAt   DateTime      @default(now())
  endedAt     DateTime?
  moodTag     String?
  summary     String?
  messages    Message[]
  safetyFlags SafetyFlag[]
}

// ... 他のモデルも同様
```

完全なスキーマは `prisma/schema.prisma` を参照してください。

## 🔮 Future Extensions

以下は今後の拡張案です：

### 短期
- [ ] 認証・認可機能の追加（JWT）
- [ ] レート制限の実装
- [ ] WebSocket対応（リアルタイムチャット）
- [ ] メッセージ検索機能

### 中期
- [ ] 感情分析の強化（より細かい粒度）
- [ ] 多言語対応
- [ ] ユーザーの長期的な傾向分析
- [ ] 通知機能（リマインダー等）

### 長期
- [ ] 音声入力対応
- [ ] マルチモーダル対応（画像、動画）
- [ ] カスタマイズ可能なAIペルソナ
- [ ] 医療機関との連携機能

## 🤝 Contributing

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 📄 License

MIT

## ⚖️ Final Disclaimer

再度強調しますが、**このシステムは医療行為ではありません**。

- あくまで技術的な実装例です
- 実際のメンタルヘルスサポートには専門家の支援が必要です
- 緊急時は必ず専門機関に連絡してください

---

Made with ❤️ for educational and research purposes.
