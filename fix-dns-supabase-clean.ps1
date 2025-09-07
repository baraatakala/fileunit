# Fix DNS and Test Supabase Connectivity - PowerShell Script
# Run this as Administrator: Right-click PowerShell → "Run as Administrator"

Write-Host "🔧 Fixing DNS and Testing Supabase Connectivity..." -ForegroundColor Yellow

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "   Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Running with Administrator privileges" -ForegroundColor Green

# Get active network adapter
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1

if ($adapter) {
    $adapterName = $adapter.Name
    Write-Host "🌐 Found active adapter: $adapterName" -ForegroundColor Cyan
    
    try {
        # Set Google DNS using Set-DnsClientServerAddress (modern PowerShell method)
        Write-Host "🔧 Setting DNS to Google (8.8.8.8, 8.8.4.4)..." -ForegroundColor Yellow
        Set-DnsClientServerAddress -InterfaceAlias $adapterName -ServerAddresses 8.8.8.8,8.8.4.4
        
        # Fallback to netsh if the above fails
        if ($LASTEXITCODE -ne 0) {
            Write-Host "🔄 Trying fallback netsh method..." -ForegroundColor Yellow
            netsh interface ip set dns "$adapterName" static 8.8.8.8
            netsh interface ip add dns "$adapterName" 8.8.4.4 index=2
        }
        
        # Flush DNS cache
        Write-Host "🔄 Flushing DNS cache..." -ForegroundColor Yellow
        ipconfig /flushdns | Out-Null
        
        Write-Host "✅ DNS configured successfully!" -ForegroundColor Green
        
        # Wait a moment for DNS to propagate
        Start-Sleep -Seconds 3
        
        # Test DNS resolution using Resolve-DnsName
        Write-Host "🔍 Testing DNS resolution..." -ForegroundColor Yellow
        try {
            $dnsResult = Resolve-DnsName "vdyuepooqnkwyxnjncva.supabase.co" -ErrorAction Stop
            Write-Host "✅ DNS resolution working! IP: $($dnsResult[0].IPAddress)" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  DNS resolution still having issues" -ForegroundColor Yellow
            Write-Host "   Trying with nslookup..." -ForegroundColor Yellow
            nslookup vdyuepooqnkwyxnjncva.supabase.co
        }
        
        # Test network connectivity
        Write-Host "🌐 Testing network connectivity..." -ForegroundColor Yellow
        try {
            $connection = Test-NetConnection -ComputerName "vdyuepooqnkwyxnjncva.supabase.co" -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue
            if ($connection) {
                Write-Host "✅ Network connectivity successful!" -ForegroundColor Green
            } else {
                Write-Host "❌ Network connectivity failed" -ForegroundColor Red
            }
        } catch {
            Write-Host "⚠️  Network test had issues: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
        # Test Supabase with Node.js (call external test file)
        Write-Host "🧪 Testing Supabase with Node.js..." -ForegroundColor Yellow
        
        # Create temporary Node.js test file
        $nodeTestContent = @'
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

console.log('🔑 Environment Check:');
console.log('   URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('   KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.log('❌ Missing environment variables');
    process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

console.log('🧪 Testing Supabase connection...');
supabase.storage.listBuckets()
  .then(({ data, error }) => {
    if (error) {
      console.log('❌ Supabase Error:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('📦 Available buckets:', data.map(b => b.name).join(', '));
      const hasConstructionFiles = data.find(b => b.name === 'construction-files');
      console.log('🏗️ construction-files bucket:', hasConstructionFiles ? 'EXISTS ✅' : 'NOT FOUND ❌');
    }
  })
  .catch(e => {
    console.log('❌ Supabase test failed:', e.message);
    if (e.message.includes('fetch failed')) {
      console.log('💡 This is still a DNS/network issue. Try:');
      console.log('   1. Restart your computer');
      console.log('   2. Check if your ISP blocks Supabase');
      console.log('   3. Try using a VPN');
    }
  });
'@
        
        # Write and execute the Node.js test
        try {
            $nodeTestContent | Out-File -FilePath "temp-supabase-test.js" -Encoding UTF8
            node "temp-supabase-test.js"
            Remove-Item "temp-supabase-test.js" -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Host "❌ Node.js test failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "💡 Make sure Node.js and npm packages are installed" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Failed to configure DNS: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Try manually setting DNS in Network Settings" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ Could not find an active network adapter" -ForegroundColor Red
}

Write-Host "`n🏁 DNS Fix Complete!" -ForegroundColor Green
Write-Host "If Supabase still doesn't work, try:" -ForegroundColor Yellow
Write-Host "   1. Restart your computer" -ForegroundColor White
Write-Host "   2. Check Windows Firewall settings" -ForegroundColor White
Write-Host "   3. Contact your ISP about Supabase domain blocking" -ForegroundColor White

pause
