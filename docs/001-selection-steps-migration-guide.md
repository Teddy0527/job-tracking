# 選考ステップ更新のマイグレーションガイド

## 概要
選考ステップの構成を5段階から新しい5段階に変更するためのマイグレーション手順です。

## 変更内容

### 選考ステップの変更

#### 変更前
```typescript
[
  { id: 1, name: 'ES提出', progress: 20 },
  { id: 2, name: '書類選考', progress: 40 },
  { id: 3, name: '一次面接', progress: 60 },
  { id: 4, name: '最終面接', progress: 80 },
  { id: 5, name: '内定', progress: 100 },
]
```

#### 変更後
```typescript
[
  { id: 1, name: '検討中', progress: 0 },
  { id: 2, name: 'ES提出済み', progress: 25 },
  { id: 3, name: '選考中（書類・適性検査）', progress: 50 },
  { id: 4, name: '選考中（面接）', progress: 75 },
  { id: 5, name: '内定獲得', progress: 100 },
]
```

## データベースマイグレーション

### 1. 必要なカラムの追加
新しいマイグレーションファイル `002_add_application_date_and_sort_order.sql` を実行して、以下のカラムを追加します：

- `application_date`: 応募日（DATE型）
- `sort_order`: ステップ内での並び順（INTEGER型）

### 2. マイグレーション実行方法

#### Supabase CLI を使用する場合
```bash
# プロジェクトルートで実行
supabase db push
```

#### Supabase ダッシュボードを使用する場合
1. Supabase ダッシュボードにログイン
2. SQL Editor を開く
3. `supabase/migrations/002_add_application_date_and_sort_order.sql` の内容をコピペして実行

## データの互換性

### 既存データへの影響
- **current_step**: IDが同じため変更不要（1-5のまま）
- **ステップ名**: アプリケーション側で自動的に新しい名前が表示される
- **進捗率**: アプリケーション側で自動的に新しい進捗率が表示される

### 既存データの自動更新
マイグレーション実行時に以下が自動実行されます：
- 既存の企業データに `sort_order` が設定される（作成日順）
- `application_date` は NULL のままで、新規企業作成時に設定される

## 注意事項

1. **ダウンタイムなし**: ステップIDが変更されないため、アプリケーションの停止は不要
2. **既存ユーザーへの影響**: ステップ名と進捗率が変更されるが、データは保持される
3. **バックアップ推奨**: マイグレーション前にデータベースのバックアップを取得することを推奨

## 検証方法

マイグレーション後、以下を確認してください：

1. 企業一覧でステップ名が新しい名前で表示されている
2. 進捗率が新しい値で表示されている
3. カンバンボードで企業の移動が正常に動作する
4. 新規企業作成時に application_date が正しく設定される

## ロールバック方法

もし問題が発生した場合のロールバック手順：

```sql
-- application_date と sort_order カラムを削除
ALTER TABLE public.companies DROP COLUMN IF EXISTS application_date;
ALTER TABLE public.companies DROP COLUMN IF EXISTS sort_order;

-- インデックスを削除
DROP INDEX IF EXISTS companies_sort_order_idx;
DROP INDEX IF EXISTS companies_application_date_idx;
```

ただし、アプリケーションコードも元に戻す必要があります。