require('dotenv').config({ path: '../.env' });

console.log("🔎 Environment Variables Check:");
console.log("   SUPABASE_URL =", process.env.SUPABASE_URL || 'NOT SET');
console.log("   SUPABASE_ANON_KEY starts with =", process.env.SUPABASE_ANON_KEY?.slice(0, 20) || 'NOT SET');
console.log("   Node.js version =", process.version);

(async () => {
  try {
    console.log("\n🌐 Testing basic fetch to Supabase...");
    console.log("   Testing URL:", process.env.SUPABASE_URL + '/rest/v1/');
    
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: { 
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    });
    
    console.log("✅ Fetch successful!");
    console.log("   Status:", res.status);
    console.log("   Status Text:", res.statusText);
    
    const text = await res.text();
    console.log("   Response:", text.substring(0, 100) + '...');
    
  } catch (err) {
    console.error("❌ Fetch failed:", err.message);
    console.error("   Error code:", err.code);
    console.error("   Full error:", err);
  }
})();
