const { createClient } = require('@supabase/supabase-js');

// Using anon key to try basic operations, but for schema changes we need service key
const supabaseUrl = 'https://zmfecumkmkaajbeeqoso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZmVjdW1rbWthYWpiZWVxb3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDU4NDIsImV4cCI6MjA2OTA4MTg0Mn0.BzNjl5mGiynQ4Z7xT5ztA6_kT65AwnZYOU4LK1vdvHE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executeWithMCP() {
  console.log('🔧 Attempting to execute migration via MCP...\n');
  
  try {
    // Try to use a stored procedure approach or edge function
    // This likely won't work with anon key, but let's try
    
    const migrationSQL = `
      ALTER TABLE public.companies 
      ADD COLUMN IF NOT EXISTS application_date DATE;
      
      ALTER TABLE public.companies 
      ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
      
      CREATE INDEX IF NOT EXISTS companies_sort_order_idx ON public.companies(sort_order);
      CREATE INDEX IF NOT EXISTS companies_application_date_idx ON public.companies(application_date);
    `;
    
    console.log('📝 Attempting to execute migration SQL...');
    
    // This will likely fail with anon key - expected behavior
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.log('❌ Expected error with anon key:', error.message);
      
      if (error.message.includes('permission denied') || error.message.includes('insufficient_privilege')) {
        console.log('\n🔑 This is expected - schema changes require service role key');
        console.log('🎯 Migration must be run with elevated privileges');
        
        printManualInstructions();
        return false;
      } else if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('\n🔧 RPC function not available - using direct SQL approach');
        printManualInstructions();
        return false;
      } else {
        throw error;
      }
    }
    
    console.log('✅ Migration executed successfully via MCP!');
    return true;
    
  } catch (error) {
    console.error('❌ MCP execution failed:', error.message);
    printManualInstructions();
    return false;
  }
}

function printManualInstructions() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 MANUAL MIGRATION REQUIRED');
  console.log('='.repeat(60));
  console.log('\n🎯 Please execute the following SQL in Supabase Dashboard:');
  console.log('\n' + '-'.repeat(40));
  console.log(`
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
`);
  console.log('-'.repeat(40));
  console.log('\n📍 Steps:');
  console.log('   1. Go to https://supabase.com/dashboard');
  console.log('   2. Select your project (zmfecumkmkaajbeeqoso)');
  console.log('   3. Click "SQL Editor" in the sidebar');
  console.log('   4. Create a new query');
  console.log('   5. Copy and paste the SQL above');
  console.log('   6. Click "Run" to execute');
  console.log('\n✅ After execution, run: node scripts/check-migration-status.js');
}

async function main() {
  const success = await executeWithMCP();
  
  if (!success) {
    console.log('\n🔄 Alternative: Set up service key for automated execution:');
    console.log('   export SUPABASE_SERVICE_KEY="your-service-key"');
    console.log('   node scripts/run-migration.js');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeWithMCP };