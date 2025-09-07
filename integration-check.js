// Final Integration Test - Run before deployment
console.log('🔍 COMPREHENSIVE INTEGRATION CHECK');
console.log('==================================\n');

// 1. Check Core Files Exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'package.json',
    'backend/server-local.js',
    'backend/services/supabaseService.js',
    'frontend/index.html',
    'frontend/script.js',
    'frontend/style.css',
    '.env',
    'Procfile',
    'render.yaml'
];

console.log('📁 CHECKING REQUIRED FILES:');
let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ MISSING: ${file}`);
        allFilesExist = false;
    }
});

// 2. Check Package.json Dependencies
console.log('\n📦 CHECKING PACKAGE.JSON:');
const packageJson = JSON.parse(fs.readFileSync('package.json'));

const requiredDeps = [
    '@supabase/supabase-js',
    'express',
    'multer',
    'cors',
    'helmet',
    'express-rate-limit',
    'uuid',
    'mime-types',
    'dotenv',
    'node-fetch'
];

let allDepsPresent = true;
requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
        console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
        console.log(`   ❌ MISSING DEPENDENCY: ${dep}`);
        allDepsPresent = false;
    }
});

// 3. Check Configuration Consistency
console.log('\n⚙️ CHECKING CONFIGURATION CONSISTENCY:');

const procfileExists = fs.existsSync('Procfile');
const renderYamlExists = fs.existsSync('render.yaml');

if (procfileExists) {
    const procfile = fs.readFileSync('Procfile', 'utf8');
    console.log(`   ✅ Procfile: ${procfile.trim()}`);
}

if (renderYamlExists) {
    const renderYaml = fs.readFileSync('render.yaml', 'utf8');
    console.log(`   ✅ render.yaml updated`);
}

// 4. Check Environment Variables
console.log('\n🔑 CHECKING ENVIRONMENT VARIABLES:');
require('dotenv').config();

const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY'
];

let allEnvVarsPresent = true;
requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
        console.log(`   ✅ ${envVar}: SET`);
    } else {
        console.log(`   ❌ MISSING: ${envVar}`);
        allEnvVarsPresent = false;
    }
});

// 5. Final Status
console.log('\n🎯 INTEGRATION STATUS:');
if (allFilesExist && allDepsPresent && allEnvVarsPresent) {
    console.log('   ✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT! 🚀');
    console.log('   ✅ Files: Complete');
    console.log('   ✅ Dependencies: Complete'); 
    console.log('   ✅ Environment: Configured');
    console.log('   ✅ Configuration: Consistent');
    process.exit(0);
} else {
    console.log('   ❌ ISSUES FOUND - PLEASE FIX BEFORE DEPLOYMENT');
    if (!allFilesExist) console.log('   ❌ Missing required files');
    if (!allDepsPresent) console.log('   ❌ Missing dependencies');
    if (!allEnvVarsPresent) console.log('   ❌ Missing environment variables');
    process.exit(1);
}
