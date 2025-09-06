// Test Supabase Integration
const SupabaseFileService = require('./services/supabaseService');

async function testSupabase() {
    console.log('🧪 Testing Supabase Integration...');
    
    const service = new SupabaseFileService();
    
    try {
        // Test 1: Fetch files (should work even if empty)
        console.log('📂 Testing file fetch...');
        const files = await service.getFiles();
        console.log(`✅ Successfully fetched ${files.length} files`);
        
        console.log('🎉 Supabase integration test passed!');
        
    } catch (error) {
        console.error('❌ Supabase test failed:', error.message);
        console.log('💡 Make sure to:');
        console.log('   1. Set SUPABASE_ANON_KEY environment variable');
        console.log('   2. Create the files table in Supabase');
        console.log('   3. Create construction-files storage bucket');
    }
}

// Run test if this file is executed directly
if (require.main === module) {
    testSupabase();
}

module.exports = testSupabase;
