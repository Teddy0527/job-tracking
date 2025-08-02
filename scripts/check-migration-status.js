const { createClient } = require('@supabase/supabase-js');

// Environment variables from .env.local  
const supabaseUrl = 'https://zmfecumkmkaajbeeqoso.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZmVjdW1rbWthYWpiZWVxb3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDU4NDIsImV4cCI6MjA2OTA4MTg0Mn0.BzNjl5mGiynQ4Z7xT5ztA6_kT65AwnZYOU4LK1vdvHE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMigrationStatus() {
  console.log('🔍 Checking migration status...\n');
  
  try {
    // Check if the new columns exist by trying to select them
    console.log('📋 Checking if application_date and sort_order columns exist...');
    
    const { data: testData, error: testError } = await supabase
      .from('companies')
      .select('id, application_date, sort_order')
      .limit(1);
    
    if (testError) {
      if (testError.message.includes('column') && testError.message.includes('does not exist')) {
        console.log('❌ Migration required: New columns do not exist');
        console.log('Error:', testError.message);
        return false;
      } else {
        console.log('⚠️ Error checking columns:', testError);
        return null;
      }
    }
    
    console.log('✅ Columns exist! Checking data...');
    
    // Check if there are any companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, current_step, application_date, sort_order')
      .limit(5);
    
    if (companiesError) {
      console.log('⚠️ Error fetching companies:', companiesError);
      return null;
    }
    
    if (!companies || companies.length === 0) {
      console.log('📭 No companies found in database');
      console.log('✅ Migration appears to be ready (no existing data to migrate)');
      return true;
    }
    
    console.log(`📊 Found ${companies.length} companies (sample):`);
    companies.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name}`);
      console.log(`     Step: ${company.current_step}`);
      console.log(`     Application Date: ${company.application_date || 'Not set'}`);
      console.log(`     Sort Order: ${company.sort_order || 'Not set'}`);
      console.log('');
    });
    
    // Check if sort_order needs to be populated
    const companiesWithoutSort = companies.filter(c => c.sort_order === null || c.sort_order === 0);
    if (companiesWithoutSort.length > 0) {
      console.log(`⚠️ ${companiesWithoutSort.length} companies need sort_order to be set`);
      console.log('🔄 Migration should be run to populate sort_order');
      return false;
    }
    
    console.log('✅ Migration appears to be complete');
    return true;
    
  } catch (error) {
    console.error('❌ Error checking migration status:', error);
    return null;
  }
}

async function showCurrentSelectionSteps() {
  console.log('\n📋 Current Selection Steps in Code:');
  
  // Import the SELECTION_STEPS from our code
  const SELECTION_STEPS = [
    { id: 1, name: '検討中', progress: 0 },
    { id: 2, name: 'ES提出済み', progress: 25 },
    { id: 3, name: '選考中（書類・適性検査）', progress: 50 },
    { id: 4, name: '選考中（面接）', progress: 75 },
    { id: 5, name: '内定獲得', progress: 100 },
  ];
  
  SELECTION_STEPS.forEach(step => {
    console.log(`  ${step.id}. ${step.name} (${step.progress}%)`);
  });
  
  // Check distribution of companies across steps
  try {
    const { data: stepDistribution, error } = await supabase
      .from('companies')
      .select('current_step')
      .then(result => {
        if (result.error) throw result.error;
        
        const distribution = {};
        result.data.forEach(company => {
          const step = company.current_step;
          distribution[step] = (distribution[step] || 0) + 1;
        });
        
        return { data: distribution, error: null };
      });
    
    if (error) {
      console.log('⚠️ Could not fetch step distribution:', error);
    } else {
      console.log('\n📊 Current distribution of companies by step:');
      SELECTION_STEPS.forEach(step => {
        const count = stepDistribution[step.id] || 0;
        console.log(`  Step ${step.id} (${step.name}): ${count} companies`);
      });
    }
    
  } catch (error) {
    console.log('⚠️ Error fetching step distribution:', error);
  }
}

async function main() {
  console.log('🚀 Job Tracker Migration Status Check\n');
  
  const migrationStatus = await checkMigrationStatus();
  await showCurrentSelectionSteps();
  
  console.log('\n' + '='.repeat(50));
  
  if (migrationStatus === true) {
    console.log('✅ Status: Migration appears to be complete');
    console.log('🎉 Your application should work with the new selection steps');
  } else if (migrationStatus === false) {
    console.log('❌ Status: Migration required');
    console.log('📋 Next steps:');
    console.log('   1. Run the migration SQL in Supabase dashboard');
    console.log('   2. Or use: node scripts/run-migration.js');
    console.log('   3. See: scripts/manual-migration-guide.md for details');
  } else {
    console.log('⚠️  Status: Could not determine migration status');
    console.log('🔍 Please check your database connection and permissions');
  }
  
  console.log('\n📖 For detailed instructions, see:');
  console.log('   - scripts/manual-migration-guide.md');
  console.log('   - docs/001-selection-steps-migration-guide.md');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { checkMigrationStatus, showCurrentSelectionSteps };