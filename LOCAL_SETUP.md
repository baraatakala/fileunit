# Local Development Setup Guide

## 🔧 Fixing Local Supabase Connection

### Problem
Local tests fail with "Connection failed: This operation was aborted"

### Solutions

#### Option 1: Windows Firewall/DNS Fix
```powershell
# Test DNS resolution
nslookup vdyuepooqnkwyxnjncva.supabase.co

# If DNS fails, try using Google DNS temporarily
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2

# Test connection
ping vdyuepooqnkwyxnjncva.supabase.co
```

#### Option 2: Environment Variable Check
```powershell
# Check if .env file is being loaded
node -e "console.log('SUPABASE_URL:', process.env.SUPABASE_URL)"
```

#### Option 3: Proxy/VPN Issues
- Disable VPN temporarily
- Check corporate firewall settings
- Try from mobile hotspot

## 🧪 Local Testing Commands

### PowerShell API Testing (Correct Commands)
```powershell
# Use Invoke-RestMethod for APIs (not curl in PowerShell)
Invoke-RestMethod -Uri "https://fileunit-1.onrender.com/api/health"
Invoke-RestMethod -Uri "https://fileunit-1.onrender.com/api/files"

# For raw HTTP testing, use curl.exe explicitly
curl.exe -I "https://fileunit-1.onrender.com/api/health"
```

### Local Node.js Testing
```javascript
// test-local.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function test() {
    try {
        const { data, error } = await supabase.from('files').select('count');
        console.log('✅ Local Supabase connection works!', data);
    } catch (err) {
        console.error('❌ Local connection failed:', err.message);
    }
}

test();
```

## 🚀 Development Workflow

1. **Start Local Server**
   ```bash
   cd backend
   node server-local.js
   ```

2. **Test Local Endpoints**
   ```bash
   curl http://localhost:3000/api/health
   curl http://localhost:3000/api/files
   ```

3. **Deploy to Render**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

4. **Test Production**
   ```bash
   curl https://fileunit-1.onrender.com/api/health
   ```
