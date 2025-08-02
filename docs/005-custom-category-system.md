# 005: カスタムカテゴリ機能

## 概要
ユーザーが独自の選考ステップを追加・編集できる機能を実装する。

## 目的
- 個人の就活スタイルに合わせた柔軟な分類
- インターンシップ、特別選考等への対応
- ユーザビリティの向上

## データベース設計

### 新規テーブル: custom_categories
```sql
CREATE TABLE custom_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  color VARCHAR(7) DEFAULT '#6c5dd3',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### companiesテーブルの更新
```sql
ALTER TABLE companies 
ADD COLUMN custom_category_id UUID REFERENCES custom_categories(id);
```

## 機能仕様

### カテゴリ管理UI
- 設定画面でのカテゴリ作成・編集・削除
- ドラッグ&ドロップでの順序変更
- カラーピッカーでの色選択

### 既存機能との統合
- KanbanBoardでのカスタムカテゴリ表示
- CompanyDialogでのカテゴリ選択
- デフォルトカテゴリとの併用

## タスク一覧
- [ ] データベーススキーマの設計・実装
- [ ] Supabaseマイグレーションファイル作成
- [ ] カスタムカテゴリCRUD API実装
- [ ] CategoryManagerコンポーネント作成
- [ ] 設定画面の追加
- [ ] KanbanBoardのカスタムカテゴリ対応
- [ ] CompanyDialogのカテゴリ選択UI更新
- [ ] データ移行ロジック（既存ユーザー対応）
- [ ] バリデーション機能
- [ ] テストケース作成

## 技術実装

### API エンドポイント
```typescript
// src/services/customCategories.ts
export const getCustomCategories = async (): Promise<CustomCategory[]>
export const createCustomCategory = async (category: Partial<CustomCategory>): Promise<CustomCategory>
export const updateCustomCategory = async (id: string, updates: Partial<CustomCategory>): Promise<CustomCategory>
export const deleteCustomCategory = async (id: string): Promise<void>
```

## 影響範囲
- データベース：新規テーブル作成
- `src/types/index.ts`：新しい型定義
- `src/services/customCategories.ts` (新規)
- `src/components/CategoryManager.tsx` (新規)
- `src/components/KanbanBoard.tsx`
- `src/components/CompanyDialog.tsx`

## 備考
- デフォルトカテゴリとの共存を考慮
- ユーザーごとのカテゴリ制限（最大20個等）を設定予定

## 優先度
**Phase 2 - 中優先度**

## 予想工数
**5-6日**