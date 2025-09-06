# Firebase Setup Guide

This guide will walk you through setting up Firebase for your Construction File Sharing Platform.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "construction-file-sharing")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Required Services

### Enable Firebase Storage
1. In your project dashboard, click "Storage" in the left sidebar
2. Click "Get started"
3. Choose "Start in test mode" for now
4. Select a location for your storage bucket
5. Click "Done"

### Enable Firestore Database
1. Click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode"
4. Select a location (preferably same as Storage)
5. Click "Enable"

## Step 3: Configure Security Rules

### Storage Rules (Development)
1. Go to Storage > Rules
2. Replace the rules with:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true; // Change to 'if request.auth != null' for production
    }
  }
}
```
3. Click "Publish"

### Firestore Rules (Development)
1. Go to Firestore Database > Rules
2. Replace the rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Change for production
    }
  }
}
```
3. Click "Publish"

## Step 4: Get Service Account Credentials

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Go to the "Service accounts" tab
4. Click "Generate new private key"
5. Click "Generate key" in the popup
6. A JSON file will download automatically
7. Rename this file to `firebase-service-account.json`
8. Move it to the `config/` folder in your project

## Step 5: Update Environment Variables

1. Open `backend/.env` file
2. Replace `your-project-id` with your actual Firebase project ID:
   ```env
   FIREBASE_STORAGE_BUCKET=your-actual-project-id.appspot.com
   FIREBASE_PROJECT_ID=your-actual-project-id
   ```

You can find your project ID in:
- Firebase Console > Project Settings > General tab
- Or in the URL: `https://console.firebase.google.com/project/YOUR_PROJECT_ID`

## Step 6: Test Configuration

1. Run the application:
   ```bash
   npm start
   ```
2. Open `http://localhost:3000`
3. Try uploading a test file
4. Check Firebase Console > Storage to see if files appear

## Troubleshooting

### Common Issues:

**Error: "Service account key not found"**
- Make sure `firebase-service-account.json` is in the `config/` folder
- Check that the file name is exactly correct (no extra spaces or characters)

**Error: "Permission denied"**
- Check your Storage and Firestore rules
- Make sure they allow read/write access

**Error: "Project not found"**
- Verify your project ID in the `.env` file
- Make sure it matches your Firebase project exactly

**Files upload but don't appear in list**
- Check Firestore rules
- Verify that Firestore database is enabled
- Check browser console for JavaScript errors

### Production Security

For production deployment, update your security rules:

**Storage Rules (Production):**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true; // Adjust based on your needs
      allow write: if request.auth != null; // Require authentication
    }
  }
}
```

**Firestore Rules (Production):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /files/{fileId} {
      allow read: if true; // Adjust based on your needs
      allow write: if request.auth != null; // Require authentication
    }
  }
}
```

## Free Tier Limits

Firebase free tier includes:
- **Storage**: 5GB
- **Firestore**: 1GB storage, 50,000 reads/day, 20,000 writes/day
- **Bandwidth**: 1GB/day

Monitor your usage in Firebase Console > Usage and billing.

## Getting Help

If you encounter issues:
1. Check the Firebase Console for error messages
2. Review the browser console (F12) for JavaScript errors
3. Check server logs for detailed error information
4. Refer to [Firebase Documentation](https://firebase.google.com/docs)

---

**🔥 Firebase Setup Complete!** 

Your construction file sharing platform is now ready to store and manage files in the cloud.
