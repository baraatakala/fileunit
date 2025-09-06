// Simple connectivity test for real Supabase project
require('dotenv').config({ path: '../.env' });

async function testConnectivity() {
    console.log('🌐 Testing Supabase Connectivity...\n');
    
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    
    // Check if credentials are still placeholders
    if (!url || url.includes('YOUR_REAL_PROJECT') || !key || key.includes('your_real')) {
        console.log('❌ Please update your .env file with real Supabase credentials');
        console.log('📋 Follow the steps in SUPABASE_SETUP_GUIDE.md');
        return;
    }
    
    console.log('🔍 Checking credentials:');
    console.log('   URL:', url);
    console.log('   Key:', key.substring(0, 20) + '...');
    
    try {
        console.log('\n🏓 Testing DNS resolution...');
        const hostname = url.replace('https://', '').replace('http://', '');
        
        // Simple fetch test with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        console.log('📡 Testing connection...');
        const response = await fetch(`${url}/rest/v1/`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('✅ Connection successful!');
        console.log('   Status:', response.status);
        console.log('   URL resolved:', hostname);
        
        if (response.status === 200) {
            console.log('🎉 Supabase API is accessible and working!');
        }
        
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        
        if (error.name === 'AbortError') {
            console.log('💡 Request timed out - check your internet connection or firewall');
        } else if (error.message.includes('fetch failed')) {
            console.log('💡 DNS resolution failed - check your Project URL');
        }
    }
}

testConnectivity().catch(console.error);
