import { createClient } from '@supabase/supabase-js';

console.log('🧪 Testing Supabase Connection...');
console.log('URL:', process.env.SUPABASE_URL);
console.log('Key:', process.env.SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function test() {
  try {
    console.log('\n📋 Testing database connection...');
    
    // Test 1: Simple query to test connection
    const { data, error } = await supabase.from('files').select('*');
    
    if (error) {
      console.error('❌ Database error:', error);
      
      if (error.message.includes('relation "public.files" does not exist')) {
        console.log('💡 Solution: Run the SQL setup in Supabase SQL Editor');
        console.log('   Copy contents from database/setup.sql');
      }
      
    } else {
      console.log('✅ Database connection successful!');
      console.log(`📊 Found ${data.length} files in database`);
      if (data.length > 0) {
        console.log('Sample file:', data[0].filename);
      }
    }
    
    // Test 2: Check storage bucket
    console.log('\n🗂️ Testing storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Storage error:', bucketError);
    } else {
      console.log('✅ Storage connection successful!');
      console.log('Available buckets:', buckets.map(b => b.name));
      
      const hasConstructionBucket = buckets.some(b => b.name === 'construction-files');
      if (!hasConstructionBucket) {
        console.log('⚠️ Missing "construction-files" bucket - create it in Storage section');
      }
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('fetch failed')) {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Check internet connection');
      console.log('   2. Try Node.js LTS version (20.x instead of 22.x)');
      console.log('   3. Disable VPN/firewall temporarily');
      console.log('   4. Check if your Supabase project is active');
    }
  }
}

test();
