# 📊 Job Tracker - 就活情報管理システム

企業の選考状況を一元管理できる就活支援Webアプリケーションです。

## ✨ 機能

- **企業カード管理**：企業名、業界、職種、マイページ情報の一元管理
- **5段階選考フロー**：ES提出 → 書類選考 → 一次面接 → 最終面接 → 内定
- **視覚的進捗管理**：カンバンボード＆テーブル表示の切り替え
- **Google Calendar連携**：面接日程・ES締切の自動同期
- **ファイル管理**：PDF・外部リンクの企業別整理
- **共有機能**：友人・キャリアセンターとの情報共有

## 🛠️ 技術スタック

- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel
- **Integration**: Google Calendar API

## 🚀 セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクト作成

1. [Supabase](https://supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. SQL Editorで `supabase-setup.sql` を実行
4. プロジェクトURLとAPI Keyをメモ

### 3. 環境変数設定

`.env.local` ファイルを更新：

```env
REACT_APP_SUPABASE_URL=your_actual_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクト作成
2. OAuth 2.0クライアントIDを作成
3. リダイレクトURLを設定：`https://your-project.supabase.co/auth/v1/callback`
4. SupabaseのAuth設定でGoogle OAuth を有効化

### 5. 開発サーバー起動

```bash
npm start
```

ブラウザで `http://localhost:3000` を開く

## 📁 プロジェクト構造

```
job-tracker/
├── src/
│   ├── components/         # UIコンポーネント
│   │   ├── CompanyCard.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── CompanyTable.tsx
│   │   └── CompanyDialog.tsx
│   ├── pages/             # ページコンポーネント
│   │   ├── LoginPage.tsx
│   │   └── Dashboard.tsx
│   ├── services/          # API・外部サービス
│   │   └── supabase.ts
│   ├── types/             # TypeScript型定義
│   │   └── index.ts
│   └── App.tsx
├── supabase-setup.sql    # データベースセットアップ
├── 要件定義書.md          # 詳細な要件定義
└── README.md
```

## 🎯 使い方

### 基本操作

1. **Googleアカウントでログイン**
2. **企業を追加**：「企業を追加」ボタンから新規登録
3. **進捗管理**：企業カードから選考ステップを更新
4. **表示切替**：カンバン・テーブル表示を使い分け

### 選考ステップ

1. **ES提出** (20%) - エントリーシート提出
2. **書類選考** (40%) - 書類審査
3. **一次面接** (60%) - 初回面接
4. **最終面接** (80%) - 最終面接
5. **内定** (100%) - 内定獲得

## 🔒 セキュリティ

- **認証**：Google OAuth 2.0
- **認可**：Row Level Security (RLS)
- **暗号化**：パスワードはクライアント側で暗号化
- **アクセス制御**：ユーザーは自分のデータのみアクセス可能

## 🚀 デプロイ

### Vercelデプロイ

```bash
npm run build
npx vercel --prod
```

環境変数をVercelのダッシュボードで設定してください。

## 📈 今後の機能拡張

- [ ] Google Calendar連携機能
- [ ] ファイルアップロード機能
- [ ] 共有機能の実装
- [ ] モバイル対応
- [ ] 通知機能

---

**MVP v1.0** | 作成日: 2025年1月26日
