-- Job Tracker Database Setup Script
-- Run this script in your Supabase SQL Editor

-- ========================================
-- 1. Enable necessary extensions
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 2. Create users table (extends auth.users)
-- ========================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  google_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. Create companies table
-- ========================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  position TEXT,
  mypage_url TEXT,
  mypage_password TEXT, -- Will be encrypted on the client side
  current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 5),
  status TEXT DEFAULT '選考中' CHECK (status IN ('選考中', '合格', '不合格')),
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS companies_user_id_idx ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS companies_current_step_idx ON public.companies(current_step);
CREATE INDEX IF NOT EXISTS companies_status_idx ON public.companies(status);
CREATE INDEX IF NOT EXISTS companies_updated_at_idx ON public.companies(updated_at DESC);

-- ========================================
-- 4. Create events table
-- ========================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('deadline', 'interview')),
  gcal_event_id TEXT, -- Google Calendar event ID for sync
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS events_company_id_idx ON public.events(company_id);
CREATE INDEX IF NOT EXISTS events_event_date_idx ON public.events(event_date);
CREATE INDEX IF NOT EXISTS events_event_type_idx ON public.events(event_type);

-- ========================================
-- 5. Create documents table
-- ========================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL, -- Supabase Storage URL
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'link')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS documents_company_id_idx ON public.documents(company_id);

-- ========================================
-- 6. Create external_links table
-- ========================================
CREATE TABLE IF NOT EXISTS public.external_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS external_links_company_id_idx ON public.external_links(company_id);

-- ========================================
-- 7. Create shared_boards table
-- ========================================
CREATE TABLE IF NOT EXISTS public.shared_boards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  share_id TEXT UNIQUE NOT NULL, -- Random string for URL
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS shared_boards_owner_id_idx ON public.shared_boards(owner_id);
CREATE INDEX IF NOT EXISTS shared_boards_share_id_idx ON public.shared_boards(share_id);

-- ========================================
-- 8. Enable Row Level Security (RLS)
-- ========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_boards ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 9. Create RLS policies
-- ========================================

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies policies
CREATE POLICY "Users can view own companies" ON public.companies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own companies" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own companies" ON public.companies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own companies" ON public.companies
  FOR DELETE USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Users can view events for own companies" ON public.events
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert events for own companies" ON public.events
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update events for own companies" ON public.events
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete events for own companies" ON public.events
  FOR DELETE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- Documents policies
CREATE POLICY "Users can view documents for own companies" ON public.documents
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents for own companies" ON public.documents
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents for own companies" ON public.documents
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents for own companies" ON public.documents
  FOR DELETE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- External links policies
CREATE POLICY "Users can view external links for own companies" ON public.external_links
  FOR SELECT USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert external links for own companies" ON public.external_links
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update external links for own companies" ON public.external_links
  FOR UPDATE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete external links for own companies" ON public.external_links
  FOR DELETE USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- Shared boards policies
CREATE POLICY "Users can view own shared boards" ON public.shared_boards
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create shared boards" ON public.shared_boards
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own shared boards" ON public.shared_boards
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own shared boards" ON public.shared_boards
  FOR DELETE USING (auth.uid() = owner_id);

-- ========================================
-- 10. Create functions and triggers
-- ========================================

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, google_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'sub'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- 11. Storage setup (run this in Supabase dashboard)
-- ========================================
/*
1. Go to Storage in your Supabase dashboard
2. Create a new bucket called 'documents'
3. Set it to public if you want direct file access, or private for more security
4. Configure RLS policies for the bucket if needed

-- Example storage policy (apply in Supabase dashboard):
CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
*/

-- ========================================
-- 12. Sample data (optional)
-- ========================================
/*
-- Uncomment to insert sample data after user registration

INSERT INTO public.companies (user_id, name, industry, position, current_step, status, memo) VALUES
  ((SELECT id FROM public.users LIMIT 1), 'サンプル株式会社', 'IT', 'エンジニア', 1, '選考中', 'サンプル企業です'),
  ((SELECT id FROM public.users LIMIT 1), 'テスト商事', '商社', '営業', 2, '選考中', 'テスト用データ'),
  ((SELECT id FROM public.users LIMIT 1), '例企業', '金融', '企画', 3, '合格', '面接順調');
*/

-- ========================================
-- Setup Complete!
-- ========================================
-- Next steps:
-- 1. Update your .env.local file with Supabase URL and anon key
-- 2. Configure Google OAuth in Supabase Auth settings
-- 3. Set up Google Calendar API credentials
-- 4. Deploy your React app

SELECT 'Database setup completed successfully!' as status;