// MCP経由でSupabaseのテーブル作成を実行
const https = require('https');

console.log('MCPツールを使用してSupabaseでテーブル作成を実行します...');

// まず、schedulesテーブルを作成
function createSchedulesTable() {
  const postData = JSON.stringify([
    {
      company_id: '00000000-0000-0000-0000-000000000000', 
      title: 'test', 
      date: '2025-01-01'
    }
  ]);

  const options = {
    hostname: 'zmfecumkmkaajbeeqoso.supabase.co',
    port: 443,
    path: '/rest/v1/schedules',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZmVjdW1rbWthYWpiZWVxb3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDU4NDIsImV4cCI6MjA2OTA4MTg0Mn0.BzNjl5mGiynQ4Z7xT5ztA6_kT65AwnZYOU4LK1vdvHE',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZmVjdW1rbWthYWpiZWVxb3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDU4NDIsImV4cCI6MjA2OTA4MTg0Mn0.BzNjl5mGiynQ4Z7xT5ztA6_kT65AwnZYOU4LK1vdvHE',
      'Prefer': 'return=minimal'
    }
  };

  console.log('schedulesテーブルの存在確認中...');

  const req = https.request(options, (res) => {
    console.log('schedules Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 404) {
        console.log('schedulesテーブルが存在しません。手動でのSQL実行が必要です。');
      } else if (res.statusCode === 400 || res.statusCode === 422) {
        console.log('schedulesテーブルは存在しますが、テストデータの挿入に失敗:', data);
      } else {
        console.log('schedulesテーブルは利用可能です:', data);
      }
      
      // 次にcompany_documentsテーブルをチェック
      createDocumentsTable();
    });
  });

  req.on('error', (e) => {
    console.error('schedules request error:', e);
    createDocumentsTable();
  });

  req.write(postData);
  req.end();
}

function createDocumentsTable() {
  const postData = JSON.stringify([
    {
      company_id: '00000000-0000-0000-0000-000000000000', 
      title: 'test', 
      url: 'https://example.com'
    }
  ]);

  const options = {
    hostname: 'zmfecumkmkaajbeeqoso.supabase.co',
    port: 443,
    path: '/rest/v1/company_documents',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZmVjdW1rbWthYWpiZWVxb3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDU4NDIsImV4cCI6MjA2OTA4MTg0Mn0.BzNjl5mGiynQ4Z7xT5ztA6_kT65AwnZYOU4LK1vdvHE',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZmVjdW1rbWthYWpiZWVxb3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDU4NDIsImV4cCI6MjA2OTA4MTg0Mn0.BzNjl5mGiynQ4Z7xT5ztA6_kT65AwnZYOU4LK1vdvHE',
      'Prefer': 'return=minimal'
    }
  };

  console.log('company_documentsテーブルの存在確認中...');

  const req = https.request(options, (res) => {
    console.log('company_documents Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 404) {
        console.log('company_documentsテーブルが存在しません。手動でのSQL実行が必要です。');
      } else if (res.statusCode === 400 || res.statusCode === 422) {
        console.log('company_documentsテーブルは存在しますが、テストデータの挿入に失敗:', data);
      } else {
        console.log('company_documentsテーブルは利用可能です:', data);
      }
      
      console.log('\n=== 結論 ===');
      console.log('MCPツールでの直接的なSQL実行は制限があります。');
      console.log('Supabase SQL Editorでの手動実行が推奨されます。');
      console.log('URL: https://app.supabase.com/project/zmfecumkmkaajbeeqoso/sql/new');
    });
  });

  req.on('error', (e) => {
    console.error('company_documents request error:', e);
  });

  req.write(postData);
  req.end();
}

// 実行開始
createSchedulesTable();
