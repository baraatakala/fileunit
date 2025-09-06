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

// Test Supabase connectivity at startup
async function testSupabaseConnectivity() {
    try {
        console.log('🔍 Testing Supabase connectivity...');
        console.log('   URL:', process.env.SUPABASE_URL || 'NOT SET');
        console.log('   Key:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
        
        // Simple test query to verify connection
        const { data, error } = await supabaseService.supabase
            .from('files')
            .select('count', { count: 'exact', head: true });
            
        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
            return false;
        }
        
        console.log('✅ Supabase connection successful');
        return true;
    } catch (error) {
        console.error('❌ Supabase connectivity test failed:', error.message);
        return false;
    }
}

// Tell Express it's behind a proxy (for Render deployment)
app.set('trust proxy', 1);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

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
        const decodedBaseName = decodeURIComponent(baseName);
        
        console.log('Getting versions for:', decodedBaseName);
        
        const versions = await supabaseService.getFileVersions(decodedBaseName);
        
        res.json(versions);
    } catch (error) {
        console.error('Get versions error:', error);
        res.status(500).json({ error: 'Failed to fetch file versions', details: error.message });
    }
});

// Download file
app.get('/api/download/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        console.log('Getting download for file ID:', fileId);
        
        // Get file info from Supabase with better error handling
        let fileData, fetchError;
        try {
            const response = await supabaseService.supabase
                .from('files')
                .select('*')
                .eq('id', fileId);
            fileData = response.data;
            fetchError = response.error;
        } catch (networkError) {
            console.error('Network error connecting to Supabase:', networkError.message);
            return res.status(503).json({ 
                error: 'Service temporarily unavailable', 
                details: 'Cannot connect to storage service'
            });
        }

        if (fetchError || !fileData || fileData.length === 0) {
            console.error('File not found for ID:', fileId, fetchError);
            return res.status(404).json({ error: 'File not found' });
        }

        const file = fileData[0];
        console.log('Found file:', file.filename, 'at path:', file.file_path);
        
        // Get signed URL for download with better error handling
        let signedUrlData, urlError;
        try {
            const response = await supabaseService.supabase.storage
                .from('construction-files')
                .createSignedUrl(file.file_path, 3600); // 1 hour expiry
            signedUrlData = response.data;
            urlError = response.error;
        } catch (networkError) {
            console.error('Network error getting signed URL:', networkError.message);
            return res.status(503).json({ 
                error: 'Service temporarily unavailable', 
                details: 'Cannot generate download link'
            });
        }

        if (urlError || !signedUrlData) {
            console.error('Error creating signed URL:', urlError);
            return res.status(500).json({ error: 'Failed to generate download URL' });
        }

        console.log('Generated signed URL for download');
        
        // Set proper headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        res.setHeader('Content-Type', file.content_type || 'application/octet-stream');
        
        // Redirect to the signed URL
        res.redirect(signedUrlData.signedUrl);
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed', details: error.message });
    }
});

// Delete file
app.delete('/api/files/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        console.log('Attempting to delete file with ID:', fileId);
        
        // Use Supabase service to delete the file
        const deleteResult = await supabaseService.deleteFile(fileId);
        
        res.json({ success: true, message: 'File deleted successfully' });
        
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Delete failed', details: error.message });
    }
});

// Health check endpoints
app.get('/api/health', async (req, res) => {
    try {
        // Get actual file count from Supabase
        const files = await supabaseService.getFiles();
        
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            storage: 'Supabase',
            files: files.length,
            service: 'File Sharing Platform'
        });
    } catch (error) {
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            storage: 'Supabase',
            files: 'Unable to fetch',
            error: error.message
        });
    }
});

// Environment check endpoint (for debugging)
app.get('/api/env-check', (req, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL || 'NOT SET',
        supabaseKeyExists: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
        serviceKeyExists: process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'NOT SET',
        bucketName: process.env.STORAGE_BUCKET || 'NOT SET',
        nodeEnv: process.env.NODE_ENV || 'NOT SET',
        port: process.env.PORT || 'NOT SET'
    });
});

// Supabase connectivity test endpoint
app.get('/api/supabase-test', async (req, res) => {
    try {
        console.log('Testing Supabase connectivity...');
        
        // Test 1: Database connection
        const { data: files, error: dbError } = await supabaseService.supabase
            .from('files')
            .select('count', { count: 'exact', head: true });
            
        if (dbError) {
            return res.status(500).json({
                success: false,
                error: 'Database connection failed',
                details: dbError.message
            });
        }
        
        // Test 2: Storage bucket access
        const { data: bucketFiles, error: storageError } = await supabaseService.supabase.storage
            .from('construction-files')
            .list('', { limit: 1 });
            
        if (storageError) {
            return res.status(500).json({
                success: false,
                error: 'Storage access failed',
                details: storageError.message
            });
        }
        
        res.json({
            success: true,
            message: 'All Supabase connections working!',
            tests: {
                database: 'Connected',
                storage: 'Connected',
                fileCount: files?.count || 'Unknown',
                storageFiles: bucketFiles?.length || 0
            }
        });
        
    } catch (error) {
        console.error('Supabase test failed:', error);
        res.status(500).json({
            success: false,
            error: 'Connection test failed',
            details: error.message
        });
    }
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

app.listen(PORT, async () => {
    console.log(`🚀 Construction File Sharing Platform`);
    console.log(`📂 Server running on port ${PORT}`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
    console.log(`💾 Storage: Supabase Cloud Storage`);
    console.log(`📁 Temp upload directory: ${uploadsDir}`);
    
    // Test Supabase connectivity after server starts
    setTimeout(async () => {
        await testSupabaseConnectivity();
    }, 2000);
});

module.exports = app;
