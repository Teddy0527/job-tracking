const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Environment variables from .env.local
const supabaseUrl = 'https://zmfecumkmkaajbeeqoso.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // You need to set this

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  console.log('Please set your Supabase service role key:');
  console.log('export SUPABASE_SERVICE_KEY="your-service-key-here"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting migration: 002_add_application_date_and_sort_order');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../supabase/migrations/002_add_application_date_and_sort_order.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      console.log(`SQL: ${statement.substring(0, 100)}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement
      });
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        throw error;
      }
      
      console.log(`✅ Statement ${i + 1} executed successfully`);
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // Verify the changes
    console.log('🔍 Verifying migration...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'companies')
      .in('column_name', ['application_date', 'sort_order']);
    
    if (tableError) {
      console.warn('⚠️ Could not verify migration:', tableError);
    } else {
      const columns = tableInfo.map(row => row.column_name);
      console.log('✅ Verified columns:', columns);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative: Direct SQL execution if RPC doesn't work
async function runMigrationDirect() {
  try {
    console.log('🚀 Starting direct migration execution');
    
    const migrationSQL = `
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
      UPDATE public.companies 
      SET sort_order = sub.row_num - 1
      FROM (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY current_step ORDER BY created_at) as row_num
        FROM public.companies
        WHERE sort_order IS NULL OR sort_order = 0
      ) sub
      WHERE companies.id = sub.id;
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n📋 Manual execution required:');
    console.log('Please run the following SQL in your Supabase dashboard:');
    console.log(fs.readFileSync(path.join(__dirname, '../supabase/migrations/002_add_application_date_and_sort_order.sql'), 'utf8'));
  }
}

if (require.main === module) {
  runMigration().catch(() => {
    console.log('\n🔄 Trying alternative approach...');
    runMigrationDirect();
  });
}

module.exports = { runMigration, runMigrationDirect };