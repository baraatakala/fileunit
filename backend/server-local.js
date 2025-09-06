const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const SupabaseFileService = require('./services/supabaseService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase service
const supabaseService = new SupabaseFileService();

// Tell Express it's behind a proxy (for Render deployment)
app.set('trust proxy', 1);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// In-memory storage for file metadata (in production, use a real database)
let fileDatabase = [];

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'", 
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://*.kaspersky-labs.com", // Allow Kaspersky scripts
                "https://*.googleapis.com",
                "https://*.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
            scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers
            styleSrc: [
                "'self'", 
                "'unsafe-inline'",
                "https://*.googleapis.com",
                "https://*.gstatic.com",
                "https://cdnjs.cloudflare.com", // Allow Font Awesome CSS
                "https://*.kaspersky-labs.com" // Allow Kaspersky CSS
            ],
            styleSrcElem: [
                "'self'", 
                "'unsafe-inline'",
                "https://*.googleapis.com",
                "https://*.gstatic.com",
                "https://cdnjs.cloudflare.com", // Allow Font Awesome CSS
                "https://*.kaspersky-labs.com" // Allow Kaspersky CSS
            ],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: [
                "'self'",
                "https://*.kaspersky-labs.com" // Allow Kaspersky connections
            ],
            fontSrc: [
                "'self'",
                "https://*.googleapis.com",
                "https://*.gstatic.com",
                "https://cdnjs.cloudflare.com" // Allow Font Awesome fonts
            ],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }
}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const fileId = uuidv4();
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        const filename = `${fileId}_${timestamp}${extension}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow specific file types for construction
        const allowedTypes = [
            'application/pdf',
            'image/dwg',
            'application/dwg',
            'application/x-dwg',
            'application/x-autocad',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/zip',
            'application/x-zip-compressed',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        const mimeType = file.mimetype;
        const extension = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(mimeType) || ['.dwg', '.dxf'].includes(extension)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'), false);
        }
    }
});

// Routes

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Upload file
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Starting Supabase file upload...');
        
        const result = await supabaseService.uploadFile(
            req.file, 
            req.file.originalname,
            req.body.userId || 'anonymous'
        );

        res.json({
            success: true,
            fileId: result.file.id,
            downloadURL: result.publicUrl,
            file: result.file,
            message: 'File uploaded successfully to Supabase'
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            error: 'Upload failed', 
            details: error.message 
        });
    }
});

// Get all files
app.get('/api/files', async (req, res) => {
    try {
        console.log('Fetching files from Supabase...');
        
        const files = await supabaseService.getFiles();
        
        console.log('Returning files:', files.length, 'files');
        res.json(files);
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch files', 
            files: [],
            details: error.message 
        });
    }
});

// Get file versions
app.get('/api/files/:baseName/versions', async (req, res) => {
    try {
        const { baseName } = req.params;
        const versions = fileDatabase
            .filter(f => f.baseName === decodeURIComponent(baseName))
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
        res.json(versions);
    } catch (error) {
        console.error('Get versions error:', error);
        res.status(500).json({ error: 'Failed to fetch file versions' });
    }
});

// Download file
app.get('/api/download/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const fileDoc = fileDatabase.find(f => f.fileId === fileId);
        
        if (!fileDoc) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const filePath = fileDoc.filePath;
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }
        
        res.download(filePath, fileDoc.originalName);
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

// Delete file
app.delete('/api/files/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const fileIndex = fileDatabase.findIndex(f => f.fileId === fileId);
        
        if (fileIndex === -1) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const fileDoc = fileDatabase[fileIndex];
        
        // Delete physical file
        if (fs.existsSync(fileDoc.filePath)) {
            fs.unlinkSync(fileDoc.filePath);
        }
        
        // Remove from database
        fileDatabase.splice(fileIndex, 1);
        
        res.json({ success: true, message: 'File deleted successfully' });
        
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Health check endpoints
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        storage: 'Supabase',
        files: fileDatabase.length
    });
});

// Render health check endpoint
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Construction File Sharing Platform`);
    console.log(`📂 Server running on port ${PORT}`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
    console.log(`💾 Storage: Local File System (uploads folder)`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
});

module.exports = app;
