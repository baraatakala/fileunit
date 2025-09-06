# Render Deployment Instructions

## IMPORTANT: Render Configuration

When deploying to Render, use these exact settings:

### Web Service Configuration:
- **Repository**: baraatakala/file-tracking
- **Branch**: main
- **Root Directory**: (leave empty)
- **Build Command**: (leave empty - auto npm install)
- **Start Command**: `node server.js`

### Environment Variables (Optional):
- `NODE_ENV=production`
- `PORT=10000`

## File Structure:
```
/
├── server.js          ← Main production server (USE THIS)
├── package.json       ← Root dependencies 
├── frontend/          ← UI files
├── backend/
│   ├── server.js      ← Local development only (DON'T USE)
│   └── server-local.js ← Local development only
```

## Common Issues:

❌ **Error**: `Cannot find module 'firebase-admin'`
**Solution**: Make sure Start Command is `node server.js` (not `node backend/server.js`)

❌ **Error**: `Cannot find module 'express'`  
**Solution**: Dependencies are in root package.json - Render will install them automatically

✅ **Correct**: Build successful, server starts on assigned port

## Your Platform Features:
🏗️ Construction file sharing with drag & drop
📁 Version control for all uploads  
🔍 Real-time search and filtering
📱 Mobile responsive design
🛡️ Security headers and rate limiting
