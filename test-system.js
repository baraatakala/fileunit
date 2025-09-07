const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const BASE_URL = 'https://fileunit-1.onrender.com';

async function testSystem() {
    console.log('🔄 Testing File Sharing Platform...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing Health Endpoint...');
        const healthResponse = await fetch(`${BASE_URL}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health:', healthData.status);
        console.log('📊 Storage:', healthData.storage);
        console.log('📁 Files:', healthData.files);
        console.log('');

        // Test 2: Get Files
        console.log('2. Testing Files Endpoint...');
        const filesResponse = await fetch(`${BASE_URL}/api/files`);
        const filesData = await filesResponse.json();
        console.log('✅ Files retrieved:', filesData.length, 'files');
        
        if (filesData.length > 0) {
            console.log('📄 Sample file:', filesData[0].name || 'No name');
        }
        console.log('');

        // Test 3: Test Upload (create a small test file)
        console.log('3. Testing File Upload...');
        const testContent = 'This is a test file created at ' + new Date().toISOString();
        const testFileName = 'test-file-' + Date.now() + '.txt';
        
        const form = new FormData();
        form.append('files', Buffer.from(testContent), {
            filename: testFileName,
            contentType: 'text/plain'
        });
        form.append('tags', 'test,automated');

        const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
            method: 'POST',
            body: form
        });

        if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            console.log('✅ Upload successful!');
            console.log('📄 Uploaded:', uploadData.files?.[0]?.name || 'File uploaded');
            
            // Test 4: Verify file appears in list
            console.log('');
            console.log('4. Verifying file in list...');
            const newFilesResponse = await fetch(`${BASE_URL}/api/files`);
            const newFilesData = await newFilesResponse.json();
            console.log('✅ Total files now:', newFilesData.length);
            
            const uploadedFile = newFilesData.find(f => f.name === testFileName);
            if (uploadedFile) {
                console.log('✅ Test file found in list!');
            } else {
                console.log('⚠️ Test file not found in list');
            }
        } else {
            console.log('❌ Upload failed:', uploadResponse.status, await uploadResponse.text());
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }

    console.log('\n🎉 System test completed!');
}

// Run the test
testSystem();
