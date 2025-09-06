require('dotenv').config({ path: '../.env' });
const https = require('https');

function testSupabaseConnection() {
    const url = process.env.SUPABASE_URL || 'https://vdyuepooqnkwyxnjncva.supabase.co';
    const hostname = url.replace('https://', '').replace('http://', '');
    
    console.log(`🔍 Testing connection to: ${hostname}`);
    
    const options = {
        hostname: hostname,
        port: 443,
        path: '/rest/v1/',
        method: 'GET',
        timeout: 5000,
        headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        console.log(`✅ Connection successful!`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Headers:`, Object.keys(res.headers).join(', '));
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`   Response: ${data.substring(0, 100)}...`);
        });
    });

    req.on('error', (err) => {
        console.error('❌ Connection failed:', err.message);
        console.error('   Error code:', err.code);
        if (err.code === 'ENOTFOUND') {
            console.log('💡 DNS resolution failed. Check your internet connection.');
        } else if (err.code === 'ETIMEDOUT') {
            console.log('💡 Connection timed out. This might be a firewall issue.');
        } else if (err.code === 'ECONNREFUSED') {
            console.log('💡 Connection refused. The server might be down.');
        }
    });

    req.on('timeout', () => {
        console.error('❌ Request timed out');
        req.destroy();
    });

    req.setTimeout(5000);
    req.end();
}

testSupabaseConnection();
