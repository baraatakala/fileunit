# RENDER DEPLOYMENT INSTRUCTIONS

## FOR RENDER.COM DEPLOYMENT

### CRITICAL: Use these EXACT settings in Render Dashboard:

**Build Settings:**
- Root Directory: (leave empty - use repository root)
- Build Command: npm install
- Start Command: node server.js

**Important Notes:**
- Use `server.js` in root (NOT `backend/server.js`)
- The root `server.js` is production-ready with all dependencies
- The `backend/server-firebase.js` is for Firebase deployment only
- The `backend/server-local.js` is for local development only

### Environment Variables (optional):
```
NODE_ENV=production
PORT=10000
```

### File Structure for Render:
```
/ (root)
├── server.js           ← RENDER USES THIS
├── package.json        ← Contains ALL dependencies
├── frontend/           ← Static files served by server.js
├── backend/uploads/    ← File storage directory
└── backend/
    ├── server-local.js     ← For local development
    └── server-firebase.js  ← For Firebase deployment
```

## Deployment Process:
1. Push changes to GitHub
2. Render auto-deploys from main branch
3. Platform available at: https://file-tracking.onrender.com
