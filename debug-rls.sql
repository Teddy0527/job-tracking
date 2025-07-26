-- RLS ポリシーの確認と修正
-- Supabase SQL Editor で実行してください

-- 1. 現在のRLSポリシーを確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'companies';

-- 2. usersテーブルが正しく設定されているか確認
SELECT * FROM public.users LIMIT 5;

-- 3. 一時的にRLSを無効化してテスト（デバッグ用）
-- ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

-- 4. RLSポリシーを再作成（必要に応じて）
DROP POLICY IF EXISTS "Users can insert own companies" ON public.companies;
CREATE POLICY "Users can insert own companies" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own companies" ON public.companies;
CREATE POLICY "Users can view own companies" ON public.companies
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own companies" ON public.companies;
CREATE POLICY "Users can update own companies" ON public.companies
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own companies" ON public.companies;
CREATE POLICY "Users can delete own companies" ON public.companies
  FOR DELETE USING (auth.uid() = user_id);

-- 5. RLSを再有効化
-- ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;