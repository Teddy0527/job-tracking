-- データベーススキーマ更新SQL
-- Supabase SQL Editorで実行してください

-- 1. companiesテーブルからindustryとpositionカラムを削除
ALTER TABLE public.companies DROP COLUMN IF EXISTS industry;
ALTER TABLE public.companies DROP COLUMN IF EXISTS position;

-- 2. schedulesテーブルの作成
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. company_documentsテーブルの作成
CREATE TABLE IF NOT EXISTS public.company_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. インデックスの追加
CREATE INDEX IF NOT EXISTS schedules_company_id_idx ON public.schedules(company_id);
CREATE INDEX IF NOT EXISTS schedules_date_idx ON public.schedules(date);
CREATE INDEX IF NOT EXISTS company_documents_company_id_idx ON public.company_documents(company_id);

-- 5. RLS (Row Level Security) の有効化
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;

-- 6. RLSポリシーの作成
-- Schedules policies
CREATE POLICY "Users can view schedules for own companies" ON public.schedules
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert schedules for own companies" ON public.schedules
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update schedules for own companies" ON public.schedules
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete schedules for own companies" ON public.schedules
  FOR DELETE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- Company documents policies
CREATE POLICY "Users can view documents for own companies" ON public.company_documents
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents for own companies" ON public.company_documents
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents for own companies" ON public.company_documents
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents for own companies" ON public.company_documents
  FOR DELETE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- 7. 更新日時の自動更新トリガー
CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_documents_updated_at
  BEFORE UPDATE ON public.company_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 完了メッセージ
SELECT 'Database schema updated successfully!' as status;