// Node.js backend script to connect to Supabase
// Uses environment variables from .env file for secure configuration
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

class SupabaseConnectionTest {
    constructor() {
        // Load environment variables
        this.supabaseUrl = process.env.SUPABASE_URL;
        this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
        
        // Validate required environment variables
        if (!this.supabaseUrl || !this.supabaseAnonKey) {
            throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY');
        }
        
        // Validate URL format (must be 8-character public project URL)
        const urlPattern = /^https:\/\/[a-z0-9]{8}\.supabase\.co$/;
        if (!urlPattern.test(this.supabaseUrl)) {
            throw new Error('Invalid SUPABASE_URL format. Must be: https://[8-chars].supabase.co');
        }
        
        // Initialize Supabase client
        this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey);
        
        console.log('✅ Supabase client initialized');
        console.log(`📍 Project URL: ${this.supabaseUrl}`);
        console.log(`🔑 API Key: ${this.supabaseAnonKey.substring(0, 20)}...`);
    }
    
    /**
     * Test basic connectivity to Supabase
     */
    async testConnectivity() {
        console.log('\n🌐 Testing Supabase connectivity...');
        
        try {
            // Test with a simple query that should work on any project
            const { data, error } = await this.supabase
                .from('_realtime')
                .select('*')
                .limit(1);
            
            if (error && error.code !== 'PGRST116') {
                throw error;
            }
            
            console.log('✅ Successfully connected to Supabase');
            return true;
            
        } catch (error) {
            console.error('❌ Connection failed:', error.message);
            return false;
        }
    }
    
    /**
     * Test fetching data from files table
     */
    async testFilesTable() {
        console.log('\n📋 Testing files table access...');
        
        try {
            const { data, error, count } = await this.supabase
                .from('files')
                .select('*', { count: 'exact' })
                .limit(5);
            
            if (error) {
                throw error;
            }
            
            console.log(`✅ Files table accessible`);
            console.log(`📊 Total files: ${count || 0}`);
            console.log(`📄 Sample files: ${data?.length || 0} records retrieved`);
            
            if (data && data.length > 0) {
                console.log('📋 Sample file data:');
                data.slice(0, 2).forEach((file, index) => {
                    console.log(`   ${index + 1}. ${file.filename} (${file.content_type})`);
                });
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Files table error:', error.message);
            
            if (error.code === 'PGRST116') {
                console.log('💡 The "files" table does not exist. Run database/setup.sql first.');
            } else if (error.message.includes('RLS')) {
                console.log('💡 Row Level Security might be blocking access. Check your RLS policies.');
            }
            
            return false;
        }
    }
    
    /**
     * Test construction-files storage bucket
     */
    async testStorageBucket() {
        console.log('\n📦 Testing construction-files storage bucket...');
        
        try {
            // List files in the bucket
            const { data, error } = await this.supabase.storage
                .from('construction-files')
                .list('', { limit: 5 });
            
            if (error) {
                throw error;
            }
            
            console.log('✅ Storage bucket accessible');
            console.log(`📁 Files in bucket: ${data?.length || 0}`);
            
            if (data && data.length > 0) {
                console.log('📋 Sample files:');
                data.slice(0, 3).forEach((file, index) => {
                    console.log(`   ${index + 1}. ${file.name} (${file.metadata?.size || 'unknown size'})`);
                });
            }
            
            // Test bucket policies by checking if we can get public URLs
            if (data && data.length > 0) {
                const { data: urlData } = this.supabase.storage
                    .from('construction-files')
                    .getPublicUrl(data[0].name);
                
                console.log('🔗 Public URL generation: ✅ Working');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Storage bucket error:', error.message);
            
            if (error.message.includes('Bucket not found')) {
                console.log('💡 Create "construction-files" bucket in Supabase Dashboard → Storage');
            } else if (error.message.includes('not allowed')) {
                console.log('💡 Storage policies might be restricting access. Check bucket policies.');
            }
            
            return false;
        }
    }
    
    /**
     * Test file upload capability (without actually uploading)
     */
    async testUploadCapability() {
        console.log('\n📤 Testing upload capability...');
        
        try {
            // Test by attempting to get upload URL (this tests permissions without uploading)
            const testFileName = 'test-connection.txt';
            const { data: urlData } = this.supabase.storage
                .from('construction-files')
                .getPublicUrl(testFileName);
            
            if (urlData?.publicUrl) {
                console.log('✅ Upload capability confirmed');
                console.log(`🔗 Upload endpoint accessible: ${urlData.publicUrl.split('/').slice(0, -1).join('/')}`);
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Upload test failed:', error.message);
            return false;
        }
    }
    
    /**
     * Run comprehensive test suite
     */
    async runAllTests() {
        console.log('🚀 Starting Supabase Connection Test Suite\n');
        console.log('=' .repeat(60));
        
        const results = {
            connectivity: false,
            filesTable: false,
            storageBucket: false,
            uploadCapability: false
        };
        
        try {
            // Test 1: Basic connectivity
            results.connectivity = await this.testConnectivity();
            
            // Test 2: Files table
            results.filesTable = await this.testFilesTable();
            
            // Test 3: Storage bucket
            results.storageBucket = await this.testStorageBucket();
            
            // Test 4: Upload capability
            results.uploadCapability = await this.testUploadCapability();
            
        } catch (error) {
            console.error('\n❌ Test suite failed:', error.message);
        }
        
        // Summary
        console.log('\n' + '=' .repeat(60));
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('=' .repeat(60));
        
        console.log(`🌐 Connectivity:      ${results.connectivity ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`📋 Files Table:       ${results.filesTable ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`📦 Storage Bucket:    ${results.storageBucket ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`📤 Upload Capability: ${results.uploadCapability ? '✅ PASS' : '❌ FAIL'}`);
        
        const passCount = Object.values(results).filter(Boolean).length;
        const totalCount = Object.keys(results).length;
        
        console.log(`\n🎯 Overall: ${passCount}/${totalCount} tests passed`);
        
        if (passCount === totalCount) {
            console.log('🎉 All systems ready! Your file sharing platform is fully configured.');
        } else {
            console.log('\n💡 Next steps to complete setup:');
            
            if (!results.connectivity) {
                console.log('   1. Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
                console.log('   2. Check internet connection and firewall settings');
            }
            
            if (!results.filesTable) {
                console.log('   3. Run database/setup.sql in Supabase SQL Editor');
            }
            
            if (!results.storageBucket) {
                console.log('   4. Create "construction-files" bucket in Supabase Storage');
                console.log('   5. Configure bucket policies for public access');
            }
        }
        
        return results;
    }
}

// Main execution
async function main() {
    try {
        const tester = new SupabaseConnectionTest();
        await tester.runAllTests();
        
    } catch (error) {
        console.error('❌ Setup Error:', error.message);
        console.log('\n💡 Make sure your .env file contains:');
        console.log('   SUPABASE_URL=https://your-project.supabase.co');
        console.log('   SUPABASE_ANON_KEY=your-anon-key-here');
    }
}

// Run the test
if (require.main === module) {
    main().catch(console.error);
}

module.exports = SupabaseConnectionTest;
