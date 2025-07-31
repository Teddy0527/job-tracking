# Vercelデプロイ手順

## 1. Vercelにログイン
```bash
vercel login
```
GitHubアカウントでログインすることを推奨

## 2. 初回デプロイ
```bash
vercel --prod
```

## 3. 環境変数の設定
Vercelダッシュボードで以下の環境変数を設定：

- `REACT_APP_SUPABASE_URL`: https://zmfecumkmkaajbeeqoso.supabase.co
- `REACT_APP_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZmVjdW1rbWthYWpiZWVxb3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDU4NDIsImV4cCI6MjA2OTA4MTg0Mn0.BzNjl5mGiynQ4Z7xT5ztA6_kT65AwnZYOU4LK1vdvHE
- `REACT_APP_REDIRECT_URL`: https://[your-domain].vercel.app/dashboard

## 4. Supabaseの設定更新
Supabaseダッシュボードで以下を設定：
- Site URL: https://[your-domain].vercel.app
- Redirect URLs: https://[your-domain].vercel.app/dashboard

## 5. 再デプロイ
環境変数設定後、再度デプロイ：
```bash
vercel --prod
```