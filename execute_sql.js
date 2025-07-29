const https = require('https');

const SUPABASE_URL = 'zmfecumkmkaajbeeqoso.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZmVjdW1rbWthYWpiZWVxb3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDU4NDIsImV4cCI6MjA2OTA4MTg0Mn0.BzNjl5mGiynQ4Z7xT5ztA6_kT65AwnZYOU4LK1vdvHE';

// SQL to execute
const sql = `
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

-- インデックスとRLSの設定は後で実行
SELECT 'Schema migration completed' as status;
`;

const postData = JSON.stringify({
  query: sql
});

const options = {
  hostname: SUPABASE_URL,
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY
  }
};

console.log('Attempting to execute SQL via Supabase API...');

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(postData);
req.end();
