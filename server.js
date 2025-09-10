const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'backend', 'uploads');
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
                "https://*.kaspersky-labs.com",
                "https://*.googleapis.com",
                "https://*.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: [
                "'self'", 
                "'unsafe-inline'",
                "https://*.googleapis.com",
                "https://*.gstatic.com",
                "https://cdnjs.cloudflare.com",
                "https://*.kaspersky-labs.com"
            ],
            styleSrcElem: [
                "'self'", 
                "'unsafe-inline'",
                "https://*.googleapis.com",
                "https://*.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
            fontSrc: [
                "'self'",
                "https://*.googleapis.com",
                "https://*.gstatic.com", 
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: ["'self'", "data:", "blob:", "*"],
            connectSrc: [
                "'self'",
                "https://*.kaspersky-labs.com"
            ],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

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
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            
            // CAD Files
            'application/octet-stream', // For .dwg files
            'application/x-autocad', // For .dwg files
            'image/vnd.dwg', // For .dwg files
            'application/x-dwg', // For .dwg files
            'application/dwg',
            'application/dxf'
        ];

        const allowedExtensions = [
            '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.zip', '.rar', '.7z',
            '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx', '.dwg', '.dxf'
        ];
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error(`نوع الملف غير مدعوم / File type not supported: ${fileExtension}. Supported: ${allowedExtensions.join(', ')}`));
        }
    }
});

// Routes

// Serve frontend
app.get('/', (req, res) => {
    console.log('Root route accessed');
    console.log('Frontend path:', path.join(__dirname, 'frontend', 'index.html'));
    
    // Check if file exists
    const frontendPath = path.join(__dirname, 'frontend', 'index.html');
    if (fs.existsSync(frontendPath)) {
        res.sendFile(frontendPath);
    } else {
        res.status(200).json({ 
            message: 'File Tracking Platform API is running',
            timestamp: new Date().toISOString(),
            endpoints: ['/api/health', '/api/files', '/api/upload']
        });
    }
});

// Upload file
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { description, tags } = req.body;
        const fileInfo = {
            id: uuidv4(),
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            description: description || '',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            uploadDate: new Date().toISOString(),
            versions: []
        };

        // Check if file with same name exists for versioning
        const existingFileIndex = fileDatabase.findIndex(f => f.originalName === req.file.originalname);
        
        if (existingFileIndex !== -1) {
            // File exists, create new version
            const existingFile = fileDatabase[existingFileIndex];
            
            // Move current file to versions
            if (!existingFile.versions) {
                existingFile.versions = [];
            }
            existingFile.versions.push({
                filename: existingFile.filename,
                uploadDate: existingFile.uploadDate,
                size: existingFile.size,
                version: existingFile.versions.length + 1
            });

            // Update with new file info
            existingFile.filename = req.file.filename;
            existingFile.size = req.file.size;
            existingFile.mimetype = req.file.mimetype;
            existingFile.uploadDate = new Date().toISOString();
            existingFile.description = description || existingFile.description;
            if (tags) {
                existingFile.tags = tags.split(',').map(tag => tag.trim());
            }

            res.json({ 
                success: true, 
                message: `File updated successfully! Version ${existingFile.versions.length + 1}`,
                fileInfo: existingFile,
                isNewVersion: true,
                versionNumber: existingFile.versions.length + 1
            });
        } else {
            // New file
            fileDatabase.push(fileInfo);
            res.json({ 
                success: true, 
                message: 'File uploaded successfully!',
                fileInfo: fileInfo,
                isNewVersion: false
            });
        }

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Upload failed' 
        });
    }
});

// Get all files
app.get('/api/files', (req, res) => {
    const filesWithUrls = fileDatabase.map(file => ({
        ...file,
        downloadUrl: `/api/download/${file.id}`,
        versionsWithUrls: file.versions ? file.versions.map(version => ({
            ...version,
            downloadUrl: `/api/download-version/${file.id}/${version.filename}`
        })) : []
    }));
    
    res.json({ success: true, files: filesWithUrls });
});

// Download file
app.get('/api/download/:fileId', (req, res) => {
    const fileId = req.params.fileId;
    const file = fileDatabase.find(f => f.id === fileId);
    
    if (!file) {
        return res.status(404).json({ success: false, message: 'File not found' });
    }

    const filePath = path.join(uploadsDir, file.filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Physical file not found' });
    }

    res.download(filePath, file.originalName);
});

// Download specific version
app.get('/api/download-version/:fileId/:versionFilename', (req, res) => {
    const { fileId, versionFilename } = req.params;
    const file = fileDatabase.find(f => f.id === fileId);
    
    if (!file) {
        return res.status(404).json({ success: false, message: 'File not found' });
    }

    const filePath = path.join(uploadsDir, versionFilename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Version file not found' });
    }

    // Get original name (remove UUID and timestamp)
    const originalName = file.originalName;
    res.download(filePath, originalName);
});

// Delete file
app.delete('/api/files/:fileId', (req, res) => {
    const fileId = req.params.fileId;
    const fileIndex = fileDatabase.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) {
        return res.status(404).json({ success: false, message: 'File not found' });
    }

    const file = fileDatabase[fileIndex];
    
    try {
        // Delete current file
        const currentFilePath = path.join(uploadsDir, file.filename);
        if (fs.existsSync(currentFilePath)) {
            fs.unlinkSync(currentFilePath);
        }

        // Delete all versions
        if (file.versions && file.versions.length > 0) {
            file.versions.forEach(version => {
                const versionFilePath = path.join(uploadsDir, version.filename);
                if (fs.existsSync(versionFilePath)) {
                    fs.unlinkSync(versionFilePath);
                }
            });
        }

        // Remove from database
        fileDatabase.splice(fileIndex, 1);
        
        res.json({ success: true, message: 'File and all versions deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete file' });
    }
});

// Rollback file to a previous version
app.post('/api/files/rollback/:fileId', (req, res) => {
    try {
        const { fileId } = req.params;
        const { targetVersion, filename } = req.body;
        
        console.log('🔄 Rollback request:', {
            fileId,
            targetVersion,
            filename
        });
        
        if (!targetVersion) {
            console.error('❌ Missing target version');
            return res.status(400).json({ error: 'Target version is required' });
        }
        
        // Find the file in the database
        const file = fileDatabase.find(f => f.id === fileId);
        if (!file) {
            console.error('❌ File not found:', fileId);
            return res.status(404).json({ error: 'File not found' });
        }
        
        console.log('✅ Found file:', file.originalName);
        
        // Find the target version
        const targetVersionFile = file.versions?.find(v => v.version === parseInt(targetVersion));
        if (!targetVersionFile) {
            console.error('❌ Target version not found:', targetVersion);
            return res.status(404).json({ error: 'Target version not found' });
        }
        
        if (file.version === parseInt(targetVersion)) {
            console.error('❌ Already at target version');
            return res.status(400).json({ error: 'Cannot rollback to current version' });
        }
        
        console.log('🎯 Rolling back from v' + file.version + ' to v' + targetVersion);
        
        // Create a backup of current version before rollback
        const currentVersionBackup = {
            version: file.version,
            filename: file.filename,
            originalName: file.originalName,
            size: file.size,
            uploadedAt: file.uploadedAt,
            description: file.description,
            tags: file.tags
        };
        
        // Update main file properties to target version
        file.version = targetVersionFile.version;
        file.filename = targetVersionFile.filename;
        file.originalName = targetVersionFile.originalName;
        file.size = targetVersionFile.size;
        file.uploadedAt = new Date().toISOString(); // Update timestamp for rollback
        file.description = targetVersionFile.description || file.description;
        file.tags = targetVersionFile.tags || file.tags;
        
        // Add current version to versions array (if not already there)
        if (!file.versions) {
            file.versions = [];
        }
        
        // Remove the target version from versions array and add current as version
        file.versions = file.versions.filter(v => v.version !== parseInt(targetVersion));
        file.versions.push(currentVersionBackup);
        
        // Sort versions by version number
        file.versions.sort((a, b) => b.version - a.version);
        
        console.log('✅ Rollback completed successfully');
        
        res.json({ 
            success: true, 
            message: `Successfully rolled back "${filename}" to version ${targetVersion}`,
            newLatestVersion: targetVersion,
            previousLatestVersion: currentVersionBackup.version
        });
        
    } catch (error) {
        console.error('❌ Rollback error:', error);
        res.status(500).json({ error: 'Rollback failed', details: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        files: fileDatabase.length,
        uptime: process.uptime()
    });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Serve frontend for all other routes (SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Construction File Sharing Server running on port ${PORT}`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
    console.log(`💾 Files in database: ${fileDatabase.length}`);
});
