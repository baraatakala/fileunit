const admin = require('firebase-admin');
require('dotenv').config();

console.log('Testing Firebase connection...');
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Storage Bucket:', process.env.FIREBASE_STORAGE_BUCKET);

try {
    // Initialize Firebase Admin SDK
    const serviceAccount = require('../config/firebase-service-account.json');
    console.log('Service account loaded successfully');
    console.log('Service account project ID:', serviceAccount.project_id);
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    
    console.log('✅ Firebase Admin initialized successfully');
    
    // Test Firestore connection
    const db = admin.firestore();
    console.log('✅ Firestore client created');
    
    // Test Storage connection
    const bucket = admin.storage().bucket();
    console.log('✅ Storage bucket connected');
    console.log('Bucket name:', bucket.name);
    
    // Try to list files collection (this will fail if Firestore isn't enabled)
    db.collection('files').limit(1).get()
        .then(() => {
            console.log('✅ Firestore connection successful');
        })
        .catch((error) => {
            console.log('❌ Firestore error:', error.message);
            if (error.message.includes('The Cloud Firestore API is not available')) {
                console.log('🔧 Solution: Enable Firestore in Firebase Console');
            }
        });
    
    // Try to access storage bucket
    bucket.getMetadata()
        .then(() => {
            console.log('✅ Storage bucket access successful');
        })
        .catch((error) => {
            console.log('❌ Storage error:', error.message);
            if (error.message.includes('not exist')) {
                console.log('🔧 Solution: Enable Storage in Firebase Console');
            }
        });
    
} catch (error) {
    console.log('❌ Firebase initialization error:', error.message);
}
