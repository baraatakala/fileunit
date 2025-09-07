// Complete Supabase Connection Test
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseComplete() {
    console.log('🧪 COMPLETE SUPABASE TEST\n');
    
    // 1. Environment Variables Check
    console.log('1️⃣ Environment Variables:');
    console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET ✅' : 'MISSING ❌');
    console.log('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET ✅' : 'MISSING ❌');
    console.log('   STORAGE_BUCKET:', process.env.STORAGE_BUCKET || 'construction-files');
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.log('\n❌ Missing required environment variables');
        process.exit(1);
    }
    
    // 2. Initialize Supabase Client
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    
    try {
        // 3. Test Database Connection
        console.log('\n2️⃣ Database Connection Test:');
        const { data: dbTest, error: dbError } = await supabase
            .from('files')
            .select('count(*)')
            .limit(1);
        
        if (dbError) {
            console.log('   ❌ Database Error:', dbError.message);
            if (dbError.message.includes('relation "files" does not exist')) {
                console.log('   💡 Need to create files table in Supabase SQL Editor');
            }
        } else {
            console.log('   ✅ Database connection successful');
        }
        
        // 4. Test Storage Buckets
        console.log('\n3️⃣ Storage Bucket Test:');
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
        
        if (storageError) {
            console.log('   ❌ Storage Error:', storageError.message);
        } else {
            console.log('   ✅ Storage connection successful');
            console.log('   📦 Available buckets:', buckets.map(b => b.name).join(', ') || 'None');
            
            const hasConstructionFiles = buckets.find(b => b.name === 'construction-files');
            console.log('   🏗️ construction-files bucket:', hasConstructionFiles ? 'EXISTS ✅' : 'NOT FOUND ❌');
            
            if (!hasConstructionFiles) {
                console.log('   💡 Create construction-files bucket in Supabase Dashboard -> Storage');
            }
        }
        
        // 5. Test File Upload Capability (without actually uploading)
        console.log('\n4️⃣ Upload Permission Test:');
        try {
            const { data: uploadTest, error: uploadError } = await supabase.storage
                .from('construction-files')
                .list('', { limit: 1 });
            
            if (uploadError) {
                console.log('   ❌ Upload test failed:', uploadError.message);
                if (uploadError.message.includes('The resource was not found')) {
                    console.log('   💡 Bucket does not exist or no access permissions');
                }
            } else {
                console.log('   ✅ Storage access permissions working');
            }
        } catch (listError) {
            console.log('   ❌ Storage list test failed:', listError.message);
        }
        
        console.log('\n🎉 Supabase test completed!');
        
    } catch (error) {
        console.log('\n❌ Test failed:', error.message);
    }
}

testSupabaseComplete();
