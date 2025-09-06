# Render Deployment Instructions

## Fixed Issues
1. **Procfile**: Updated to point to the correct `server.js` in root directory
2. **render.yaml**: Updated start command to use `node server.js` directly
3. **Repository**: Confirmed all necessary files are committed and pushed

## Render Configuration Steps

### 1. Service Type
- **Type**: Web Service
- **Build Command**: `npm install`
- **Start Command**: `node server.js` (or use npm start)

### 2. Environment Variables
Set these in Render dashboard:
```
NODE_ENV=production
PORT=10000
```

### 3. Required Files in Repository
✅ `server.js` (main server file in root)
✅ `package.json` (dependencies and scripts)
✅ `Procfile` (fixed to use correct server file)
✅ `frontend/` directory (static files)
✅ `backend/uploads/` directory structure

### 4. File Structure Expected by Deployment
```
/
├── server.js (MAIN SERVER FILE)
├── package.json
├── Procfile
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
└── backend/
    └── uploads/ (created automatically)
```

## Troubleshooting
- **Error "Cannot find module server.js"**: Make sure server.js is in root directory and committed to git
- **Port issues**: Render uses PORT environment variable (already configured in server.js)
- **File uploads**: The uploads directory is created automatically by the server

## Post-Deployment
The application will be available at your Render URL with:
- File upload functionality
- Frontend served from `/frontend/` directory
- API endpoints for file management

## Notes
- The server serves both API endpoints and static frontend files
- Uploads are stored in the `backend/uploads` directory
- File metadata is currently stored in memory (consider database for production)
