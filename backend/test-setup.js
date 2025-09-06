// Test and setup database table
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://vdyuepooqnkwyxnjncva.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeXVlcG9vcW5rd3l4bmpuY3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjY3NDQsImV4cCI6MjA3Mjc0Mjc0NH0.Vq71PYlP5x9KYYdPjCSmYUjp-5mCTaYhJAYdAeZXcNw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
    console.log('🔍 Testing database connection...');
    
    try {
        // Test basic connection by trying to query the files table
        const { data, error } = await supabase
            .from('files')
            .select('count', { count: 'exact' })
            .limit(1);
        
        if (error) {
            console.log('❌ Database error:', error.message);
            console.log('💡 This usually means:');
            console.log('   1. The "files" table does not exist');
            console.log('   2. RLS policies are blocking access');
            console.log('   3. Wrong API key or URL');
            console.log('\n📋 To fix this:');
            console.log('   1. Go to your Supabase dashboard');
            console.log('   2. Go to SQL Editor');
            console.log('   3. Run the setup.sql file from database/ folder');
            return false;
        }
        
        console.log('✅ Database connection successful!');
        console.log('📊 Files table exists and is accessible');
        return true;
        
    } catch (err) {
        console.log('❌ Connection failed:', err.message);
        return false;
    }
}

async function testStorage() {
    console.log('\n📦 Testing storage bucket...');
    
    try {
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
            console.log('❌ Storage error:', error.message);
            return false;
        }
        
        const bucket = data.find(b => b.name === 'construction-files');
        if (bucket) {
            console.log('✅ Storage bucket "construction-files" found!');
            return true;
        } else {
            console.log('❌ Storage bucket "construction-files" not found');
            console.log('💡 Create it in Supabase Dashboard -> Storage');
            return false;
        }
        
    } catch (err) {
        console.log('❌ Storage test failed:', err.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Supabase Setup Test\n');
    
    const dbOk = await testDatabase();
    const storageOk = await testStorage();
    
    console.log('\n📋 Summary:');
    console.log('   Database:', dbOk ? '✅ Ready' : '❌ Needs setup');
    console.log('   Storage:', storageOk ? '✅ Ready' : '❌ Needs setup');
    
    if (dbOk && storageOk) {
        console.log('\n🎉 Everything is ready! You can now use the file sharing platform.');
    } else {
        console.log('\n⚠️  Setup required. Follow the instructions above.');
    }
}

main().catch(console.error);
