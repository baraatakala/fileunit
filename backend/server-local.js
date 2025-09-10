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
            frameSrc: ["'self'"] // Allow iframes from same origin for file previews
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

// Configure multer for file uploads - use memory storage for binary files with UTF-8 support
const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage to preserve buffer for binary files
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    },
    fileFilter: (req, file, cb) => {
        // Ensure proper UTF-8 encoding for Arabic filenames
        if (file.originalname) {
            try {
                // Check if filename contains corrupted Arabic characters
                if (file.originalname.includes('Ø') || file.originalname.includes('Ù') || file.originalname.includes('ÙØ')) {
                    // This indicates Latin-1 encoded Arabic, convert to UTF-8
                    const properUtf8Name = Buffer.from(file.originalname, 'latin1').toString('utf8');
                    file.originalname = properUtf8Name;
                    console.log('✅ Fixed Arabic filename:', properUtf8Name);
                }
            } catch (error) {
                console.log('⚠️ Filename encoding fix failed, using original:', error);
            }
        }
        // Allow specific file types for construction with Arabic filename support
        const allowedTypes = [
            // Documents
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            
            // Images
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            
            // CAD Files
            'image/dwg',
            'application/dwg',
            'application/x-dwg',
            'application/x-autocad',
            'application/acad',
            'image/vnd.dwg',
            'drawing/dwg',
            'image/vnd.dxf',
            'application/dxf',
            
            // Archives
            'application/zip',
            'application/x-zip-compressed',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            
            // Excel Files
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            
            // PowerPoint Files
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        
        const mimeType = file.mimetype;
        const extension = path.extname(file.originalname).toLowerCase();
        
        // Support for various file extensions including Excel
        const allowedExtensions = [
            '.pdf', '.dwg', '.dxf', '.jpg', '.jpeg', '.png', '.gif', '.webp',
            '.zip', '.rar', '.7z', '.doc', '.docx', '.txt', 
            '.xls', '.xlsx', '.ppt', '.pptx'
        ];
        
        if (allowedTypes.includes(mimeType) || allowedExtensions.includes(extension)) {
            cb(null, true);
        } else {
            cb(new Error(`نوع الملف غير مدعوم / File type not allowed: ${extension}. Supported: PDF, DWG, DXF, Images, Excel, Word, PowerPoint, ZIP`), false);
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
        console.log('Description:', req.body.description);
        console.log('Tags:', req.body.tags);
        
        const result = await supabaseService.uploadFile(
            req.file, 
            req.file.originalname,
            req.body.userId || 'anonymous',
            req.body.description || '',
            req.body.tags || ''
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
        
        // Instead of redirecting, fetch the file and stream it properly for binary files
        const fetch = require('node-fetch');
        try {
            const fileResponse = await fetch(signedUrlData.signedUrl);
            
            if (!fileResponse.ok) {
                throw new Error(`HTTP error! status: ${fileResponse.status}`);
            }
            
            // Set proper headers for file download with Arabic filename support
            const encodedFilename = encodeURIComponent(file.filename);
            const asciiFilename = file.filename.replace(/[^\x00-\x7F]/g, ""); // Fallback ASCII name
            
            // Use RFC 5987 encoding for proper Arabic filename support
            res.setHeader('Content-Disposition', 
                `attachment; filename="${asciiFilename || 'download'}"; filename*=UTF-8''${encodedFilename}`
            );
            res.setHeader('Content-Type', file.content_type || 'application/octet-stream');
            res.setHeader('Content-Length', fileResponse.headers.get('content-length') || '0');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            
            // For binary files, we need to handle the buffer properly
            const buffer = await fileResponse.buffer();
            res.end(buffer);
            
        } catch (streamError) {
            console.error('Error streaming file:', streamError.message);
            return res.status(500).json({ error: 'Failed to download file', details: streamError.message });
        }
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed', details: error.message });
    }
});

// Preview file endpoint - serves files inline for browser preview
app.get('/api/preview/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        console.log('Getting preview for file ID:', fileId);
        
        // Get file info from Supabase
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
        console.log('Found file for preview:', file.filename, 'at path:', file.file_path);
        
        // Get signed URL for preview
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
                details: 'Cannot generate preview link'
            });
        }

        if (urlError || !signedUrlData) {
            console.error('Error creating signed URL:', urlError);
            return res.status(500).json({ error: 'Failed to generate preview URL' });
        }

        console.log('Generated signed URL for preview');
        
        // Fetch the file and stream it for inline display
        const fetch = require('node-fetch');
        try {
            const fileResponse = await fetch(signedUrlData.signedUrl);
            
            if (!fileResponse.ok) {
                throw new Error(`HTTP error! status: ${fileResponse.status}`);
            }
            
            // Set proper headers for inline display (not attachment)
            res.setHeader('Content-Type', file.content_type || 'application/octet-stream');
            res.setHeader('Content-Length', fileResponse.headers.get('content-length') || '0');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            
            // For PDFs and images, allow inline display
            if (file.content_type && (file.content_type.includes('pdf') || file.content_type.includes('image'))) {
                res.setHeader('Content-Disposition', 'inline');
            }
            
            // Stream the file buffer
            const buffer = await fileResponse.buffer();
            res.end(buffer);
            
        } catch (streamError) {
            console.error('Error streaming file for preview:', streamError.message);
            return res.status(500).json({ error: 'Failed to preview file', details: streamError.message });
        }
        
    } catch (error) {
        console.error('Preview route error:', error);
        res.status(500).json({ error: 'Preview failed', details: error.message });
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

// Rollback file to a previous version
app.post('/api/files/rollback/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const { targetVersion, filename } = req.body;
        
        console.log('🔄 Rollback request:', {
            fileId,
            targetVersion,
            filename,
            body: req.body
        });
        
        if (!targetVersion) {
            console.error('❌ Missing target version');
            return res.status(400).json({ error: 'Target version is required' });
        }
        
        // Get the target version file details
        console.log('📄 Fetching target file details for ID:', fileId);
        const { data: targetFile, error: fetchError } = await supabaseService.supabase
            .from('files')
            .select('*')
            .eq('id', fileId)
            .single();

        if (fetchError || !targetFile) {
            console.error('❌ Target file not found:', fetchError);
            return res.status(404).json({ error: 'Target version not found', details: fetchError?.message });
        }
        
        console.log('✅ Found target file:', targetFile.filename, 'base_name:', targetFile.base_name);
        
        // Get all current versions of this file
        const baseName = targetFile.base_name;
        console.log('📋 Fetching all versions for base_name:', baseName);
        
        // Handle case where base_name might be null/undefined - use filename as fallback
        const searchCriteria = baseName || targetFile.filename || targetFile.original_name;
        const searchField = baseName ? 'base_name' : 'filename';
        
        console.log('🔍 Using search criteria:', searchField, '=', searchCriteria);
        
        const { data: allVersions, error: versionsError } = await supabaseService.supabase
            .from('files')
            .select('*')
            .eq(searchField, searchCriteria)
            .order('version', { ascending: false });

        if (versionsError) {
            console.error('❌ Error fetching versions:', versionsError);
            return res.status(500).json({ error: 'Failed to fetch file versions', details: versionsError.message });
        }

        if (!allVersions || allVersions.length === 0) {
            console.error('❌ No versions found for:', searchField, '=', searchCriteria);
            return res.status(404).json({ error: 'No file versions found' });
        }

        console.log('📊 Found versions:', allVersions?.length, 'versions');
        allVersions?.forEach(v => console.log(`  - v${v.version} (${v.is_latest ? 'Latest' : 'Old'})`));

        // Find current latest version
        const currentLatest = allVersions.find(v => v.is_latest === true);
        const targetVersionFile = allVersions.find(v => v.version === targetVersion);

        if (!targetVersionFile) {
            console.error('❌ Target version not found in versions list');
            return res.status(404).json({ error: 'Target version not found' });
        }

        if (targetVersionFile.is_latest) {
            console.error('❌ Attempting to rollback to current version');
            return res.status(400).json({ error: 'Cannot rollback to current version' });
        }

        console.log('🎯 Rolling back from v' + (currentLatest?.version || 'unknown') + ' to v' + targetVersion);

        // Start transaction-like operations
        const updates = [];
        
        // 1. Remove latest flag from current latest version
        if (currentLatest) {
            updates.push(
                supabaseService.supabase
                    .from('files')
                    .update({ is_latest: false })
                    .eq('id', currentLatest.id)
            );
        }
        
        // 2. Set target version as latest
        updates.push(
            supabaseService.supabase
                .from('files')
                .update({ 
                    is_latest: true,
                    updated_at: new Date().toISOString()
                })
                .eq('id', fileId)
        );

        // Execute all updates
        const results = await Promise.all(updates);
        
        // Check if any updates failed
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
            console.error('Rollback update errors:', errors);
            return res.status(500).json({ error: 'Failed to update version flags' });
        }

        console.log('✅ Rollback completed successfully');
        
        res.json({ 
            success: true, 
            message: `Successfully rolled back "${filename}" to version ${targetVersion}`,
            newLatestVersion: targetVersion,
            previousLatestVersion: currentLatest ? currentLatest.version : null
        });
        
    } catch (error) {
        console.error('Rollback error:', error);
        res.status(500).json({ error: 'Rollback failed', details: error.message });
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

// S3 credentials test endpoint
app.get('/api/s3-check', (req, res) => {
    const s3Config = {
        endpoint: process.env.S3_ENDPOINT || 'NOT SET',
        accessKey: process.env.S3_ACCESS_KEY_ID ? 'SET (length: ' + process.env.S3_ACCESS_KEY_ID.length + ')' : 'NOT SET',
        secretKey: process.env.S3_SECRET_ACCESS_KEY ? 'SET (length: ' + process.env.S3_SECRET_ACCESS_KEY.length + ')' : 'NOT SET',
        region: process.env.S3_REGION || 'NOT SET',
        bucket: process.env.STORAGE_BUCKET || 'NOT SET'
    };
    
    res.json({
        status: 'S3 Configuration Check',
        config: s3Config,
        timestamp: new Date().toISOString(),
        note: 'S3 provides alternative access to Supabase Storage via AWS S3 protocol'
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
