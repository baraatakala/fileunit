// Test script to verify deployment and Supabase integration
async function testDeployment() {
    const baseUrl = 'https://fileunit-1.onrender.com';
    
    console.log('🚀 Testing File Sharing Platform Deployment...');
    
    try {
        // Test 1: Check if server is running
        console.log('\n1. Testing server health...');
        const healthResponse = await fetch(baseUrl);
        console.log(`   Status: ${healthResponse.status}`);
        console.log(`   Server is ${healthResponse.ok ? '✅ ONLINE' : '❌ OFFLINE'}`);
        
        // Test 2: Check files endpoint
        console.log('\n2. Testing files API...');
        const filesResponse = await fetch(`${baseUrl}/api/files`);
        console.log(`   Files API Status: ${filesResponse.status}`);
        
        if (filesResponse.ok) {
            const files = await filesResponse.json();
            console.log(`   ✅ Files API working - Found ${files.length} files`);
        } else {
            const errorText = await filesResponse.text();
            console.log(`   ❌ Files API error: ${errorText}`);
        }
        
        // Test 3: Check for specific error messages
        console.log('\n3. Checking for common deployment issues...');
        const pageContent = await healthResponse.text();
        
        if (pageContent.includes('MODULE_NOT_FOUND')) {
            console.log('   ❌ MODULE_NOT_FOUND error detected');
        } else if (pageContent.includes('Supabase')) {
            console.log('   ✅ Supabase integration detected');
        } else {
            console.log('   ⚠️  No specific integration indicators found');
        }
        
    } catch (error) {
        console.log(`❌ Deployment test failed: ${error.message}`);
    }
}

// Run the test
testDeployment();
