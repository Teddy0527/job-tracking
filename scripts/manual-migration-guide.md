# マイグレーション実行ガイド（MCP対応）

## MCPを使用したマイグレーション実行方法

### 方法1: Supabase ダッシュボード（推奨）

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクト `zmfecumkmkaajbeeqoso` を選択
3. 左サイドバーから「SQL Editor」をクリック
4. 新しいクエリを作成
5. 以下のSQLをコピー&ペーストして実行：

```sql
-- Add application_date column
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS application_date DATE;

-- Add sort_order column for ordering within steps
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add index for sort_order to improve query performance
CREATE INDEX IF NOT EXISTS companies_sort_order_idx ON public.companies(sort_order);

-- Add index for application_date
CREATE INDEX IF NOT EXISTS companies_application_date_idx ON public.companies(application_date);

-- Update existing companies with default sort_order based on creation date
-- This ensures existing companies have a proper sort order within their steps
UPDATE public.companies 
SET sort_order = sub.row_num - 1
FROM (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY current_step ORDER BY created_at) as row_num
  FROM public.companies
  WHERE sort_order IS NULL OR sort_order = 0
) sub
WHERE companies.id = sub.id;
```

### 方法2: Node.jsスクリプト経由

1. Supabaseサービスキーを取得：
   - Dashboard → Settings → API → service_role key をコピー

2. 環境変数を設定：
   ```bash
   export SUPABASE_SERVICE_KEY="your-service-role-key-here"
   ```

3. マイグレーションスクリプトを実行：
   ```bash
   node scripts/run-migration.js
   ```

### 方法3: Supabase CLI（ローカル開発）

**注意**: 現在Docker環境が起動していないため、この方法は使用できません。

```bash
# プロジェクトとリンク（初回のみ）
supabase login
supabase link --project-ref zmfecumkmkaajbeeqoso

# マイグレーション実行
supabase db push
```

## 実行後の確認方法

以下のSQLで変更が正しく適用されたかを確認できます：

```sql
-- カラムが追加されたかを確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND column_name IN ('application_date', 'sort_order');

-- インデックスが作成されたかを確認
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'companies' 
AND indexname IN ('companies_sort_order_idx', 'companies_application_date_idx');

-- 既存データにsort_orderが設定されたかを確認
SELECT current_step, COUNT(*) as company_count, 
       MIN(sort_order) as min_sort, MAX(sort_order) as max_sort
FROM public.companies
GROUP BY current_step
ORDER BY current_step;
```

## トラブルシューティング

### エラー: "relation does not exist"
- テーブル名が正しいかを確認
- 適切なスキーマ（public）を指定しているかを確認

### エラー: "permission denied"
- service_role キーを使用しているかを確認
- RLS（Row Level Security）の設定を確認

### エラー: "column already exists"
- `IF NOT EXISTS` が含まれているため、このエラーは発生しないはずです
- 既にマイグレーションが実行済みの可能性があります

## 成功の確認

マイグレーション成功後、以下が確認できるはずです：

1. ✅ `application_date` カラムが追加された
2. ✅ `sort_order` カラムが追加された  
3. ✅ 適切なインデックスが作成された
4. ✅ 既存の企業データに `sort_order` が設定された
5. ✅ アプリケーションで新しい選考ステップ名が表示される

## 次のステップ

マイグレーション完了後：

1. アプリケーションを再起動
2. 各選考ステップの表示名が更新されているかを確認
3. 企業の並び順が正常に動作するかを確認
4. 新規企業作成時に応募日が正しく保存されるかを確認