# mental-health-companion-core

メンタル系AIコンパニオンのコアロジック。セッション管理・安全ガード・ジャーナル蓄積などを提供するバックエンドシステム。

## ⚠️ 重要な免責事項

**このシステムは医療行為ではありません。**

- 本システムは、技術的な実装例であり、教育・研究目的で開発されています
- 医学的診断、治療、カウンセリングを提供するものではありません
- メンタルヘルスに関する専門的なサポートが必要な場合は、必ず医療機関や専門家にご相談ください
- 緊急時や危機的状況では、適切な専門機関（いのちの電話、救急サービスなど）に連絡してください

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **LLM**: OpenAI API / Anthropic Claude API
- **API**: RESTful API (Express)

## Features

### 1. セッション管理
- ユーザーとの対話セッションを開始・終了
- セッションごとの気分タグとサマリー管理
- メッセージ履歴の保存と取得

### 2. AIチャット機能
- OpenAI GPT または Anthropic Claude を使用した共感的な対話
- セッション履歴を考慮したコンテキスト維持
- 心の健康をサポートするシステムプロンプト

### 3. セーフティチェック
- 自傷関連キーワードの検出
- 危険度レベル（low, medium, high, critical）の判定
- クライシス対応メッセージの自動表示
- セッションごとの安全フラグ記録

### 4. ジャーナル生成
- セッション終了時に自動でジャーナルエントリを生成
- LLMによるサマリーとキーワード抽出
- ユーザーの気持ちや考えを整理した記録

## Architecture

```
src/
├── api/              # REST APIエンドポイント
│   └── routes.ts
├── services/         # ビジネスロジック層
│   ├── session.service.ts
│   ├── chat.service.ts
│   ├── journal.service.ts
│   └── safety.service.ts
├── config/           # 設定管理
│   └── index.ts
├── types/            # TypeScript型定義
│   └── index.ts
├── lib/              # ユーティリティ
│   └── prisma.ts
└── index.ts          # エントリーポイント
```

## Getting Started

### 1. 環境セットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数ファイルのコピー
cp .env.example .env

# .envファイルを編集して、必要な情報を設定
# - DATABASE_URL: PostgreSQL接続文字列
# - LLM_PROVIDER: openai または anthropic
# - OPENAI_API_KEY または ANTHROPIC_API_KEY
```

### 2. データベースセットアップ

```bash
# Prismaマイグレーションを実行
npm run prisma:migrate

# Prisma Clientを生成
npm run prisma:generate
```

### 3. サーバー起動

```bash
# 開発モード
npm run dev

# 本番モード
npm run build
npm start
```

サーバーは `http://localhost:3000` で起動します。

## API Endpoints

### セッション管理

```bash
# セッション開始
POST /api/sessions/start
{
  "userId": "user123",
  "moodTag": "穏やか"
}

# セッション終了（ジャーナル生成あり）
POST /api/sessions/:sessionId/end
{
  "generateJournal": true
}

# セッション情報取得
GET /api/sessions/:sessionId

# ユーザーのセッション一覧
GET /api/users/:userId/sessions
```

### チャット

```bash
# メッセージ送信
POST /api/chat
{
  "sessionId": "session123",
  "message": "今日はちょっと疲れています"
}
```

### ジャーナル

```bash
# ユーザーのジャーナル一覧
GET /api/users/:userId/journals

# ジャーナル詳細
GET /api/journals/:journalId
```

### ヘルスチェック

```bash
GET /api/health
```

## Database Schema

### User
- id: ユーザーID
- externalId: 外部システムのID（オプション）
- createdAt: 作成日時

### Session
- id: セッションID
- userId: ユーザーID
- startedAt: 開始日時
- endedAt: 終了日時
- moodTag: 気分タグ
- summary: セッションサマリー

### Message
- id: メッセージID
- sessionId: セッションID
- role: user / ai
- content: メッセージ内容
- createdAt: 作成日時

### JournalEntry
- id: ジャーナルID
- userId: ユーザーID
- date: 日付
- title: タイトル
- content: 本文
- tags: タグ（JSON配列）

### SafetyFlag
- id: フラグID
- sessionId: セッションID
- flagType: フラグの種類
- keyword: 検出されたキーワード
- severity: 危険度（low, medium, high, critical）

## Safety Features

システムは以下のキーワードを検出し、適切に対応します：

- **Critical**: 自殺、死にたい、など
- **High**: 自傷、リストカット、など
- **Medium**: つらい、苦しい、など

危機的なキーワードが検出された場合、専門機関への相談を促すメッセージを自動的に返します。

## Development

```bash
# TypeScriptのビルド
npm run build

# Prisma Studioでデータベースを確認
npm run prisma:studio
```

## Environment Variables

| 変数名 | 説明 | 必須 |
|--------|------|------|
| DATABASE_URL | PostgreSQL接続文字列 | ✓ |
| LLM_PROVIDER | LLMプロバイダー (openai/anthropic) | ✓ |
| OPENAI_API_KEY | OpenAI APIキー | * |
| ANTHROPIC_API_KEY | Anthropic APIキー | * |
| PORT | サーバーポート番号 | - |
| ENABLE_SAFETY_CHECKS | セーフティチェック有効化 | - |

*LLM_PROVIDERに応じて、どちらか一方が必須

## License

MIT

## Disclaimer

再度強調しますが、**このシステムは医療行為ではありません**。あくまで技術的な骨格を示すものであり、実際のメンタルヘルスサポートには専門家の支援が必要です。
