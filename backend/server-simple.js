const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory file database
let fileDatabase = [];

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Helper function to save file to disk
function saveFileToDisk(buffer, filename) {
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

// Helper function to get file extension icon
function getFileIcon(filename) {
    const ext = path.extname(filename).toLowerCase();
    const iconMap = {
        '.pdf': 'fas fa-file-pdf',
        '.doc': 'fas fa-file-word',
        '.docx': 'fas fa-file-word',
        '.xls': 'fas fa-file-excel',
        '.xlsx': 'fas fa-file-excel',
        '.ppt': 'fas fa-file-powerpoint',
        '.pptx': 'fas fa-file-powerpoint',
        '.jpg': 'fas fa-file-image',
        '.jpeg': 'fas fa-file-image',
        '.png': 'fas fa-file-image',
        '.gif': 'fas fa-file-image',
        '.zip': 'fas fa-file-archive',
        '.rar': 'fas fa-file-archive',
        '.txt': 'fas fa-file-alt',
        '.dwg': 'fas fa-drafting-compass',
        '.dxf': 'fas fa-drafting-compass'
    };
    return iconMap[ext] || 'fas fa-file';
}

// Routes

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Upload file
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const fileId = uuidv4();
        const timestamp = new Date().toISOString();
        const originalName = file.originalname;
        const fileExtension = path.extname(originalName);
        const baseName = path.basename(originalName, fileExtension);
        
        // Create unique filename
        const uniqueFileName = `${fileId}_${Date.now()}${fileExtension}`;
        
        // Save file to disk
        const filePath = saveFileToDisk(file.buffer, uniqueFileName);
        
        // Get form data
        const description = req.body.description || '';
        const tags = req.body.tags || '';
        
        // Create file record
        const fileRecord = {
            id: fileId,
            originalName: originalName,
            filename: originalName,
            baseName: baseName,
            size: file.size,
            mimetype: file.mimetype,
            uploadedAt: timestamp,
            description: description,
            tags: tags,
            filePath: filePath,
            uniqueFileName: uniqueFileName,
            icon: getFileIcon(originalName),
            isLatest: true,
            version: '1.0'
        };
        
        // Check if file with same base name exists
        const existingFiles = fileDatabase.filter(f => f.baseName === baseName);
        if (existingFiles.length > 0) {
            // Mark previous versions as not latest
            existingFiles.forEach(f => f.isLatest = false);
            // Set version number
            fileRecord.version = `${existingFiles.length + 1}.0`;
        }
        
        // Add to database
        fileDatabase.push(fileRecord);
        
        console.log(`✅ File uploaded: ${originalName} (ID: ${fileId})`);
        
        res.json({ 
            success: true, 
            message: 'File uploaded successfully',
            fileId: fileId 
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
    }
});

// Get all files (latest versions only)
app.get('/api/files', (req, res) => {
    try {
        const latestFiles = fileDatabase
            .filter(file => file.isLatest)
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
        console.log(`📋 Returning ${latestFiles.length} files`);
        res.json(latestFiles);
        
    } catch (error) {
        console.error('Get files error:', error);
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});

// Get file versions
app.get('/api/files/:baseName/versions', (req, res) => {
    try {
        const { baseName } = req.params;
        const versions = fileDatabase
            .filter(file => file.baseName === baseName)
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
            .map((file, index) => ({
                ...file,
                version: `${versions.length - index}.0`,
                isLatest: index === 0
            }));
        
        console.log(`📋 Found ${versions.length} versions for ${baseName}`);
        res.json(versions);
        
    } catch (error) {
        console.error('Get versions error:', error);
        res.status(500).json({ error: 'Failed to fetch versions' });
    }
});

// Download file
app.get('/api/download/:fileId', (req, res) => {
    try {
        const { fileId } = req.params;
        const file = fileDatabase.find(f => f.id === fileId);
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        if (!fs.existsSync(file.filePath)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }
        
        console.log(`📥 Downloading: ${file.originalName}`);
        
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Type', file.mimetype);
        res.sendFile(path.resolve(file.filePath));
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

// Preview file
app.get('/api/preview/:fileId', (req, res) => {
    try {
        const { fileId } = req.params;
        const file = fileDatabase.find(f => f.id === fileId);
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        if (!fs.existsSync(file.filePath)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }
        
        console.log(`👀 Previewing: ${file.originalName}`);
        
        res.setHeader('Content-Type', file.mimetype);
        res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
        res.sendFile(path.resolve(file.filePath));
        
    } catch (error) {
        console.error('Preview error:', error);
        res.status(500).json({ error: 'Preview failed' });
    }
});

// Delete file
app.delete('/api/files/:fileId', (req, res) => {
    try {
        const { fileId } = req.params;
        const fileIndex = fileDatabase.findIndex(f => f.id === fileId);
        
        if (fileIndex === -1) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const file = fileDatabase[fileIndex];
        
        // Delete from disk
        if (fs.existsSync(file.filePath)) {
            fs.unlinkSync(file.filePath);
        }
        
        // Remove from database
        fileDatabase.splice(fileIndex, 1);
        
        console.log(`🗑️ Deleted: ${file.originalName}`);
        res.json({ success: true, message: 'File deleted successfully' });
        
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Update file metadata
app.put('/api/files/:fileId/metadata', (req, res) => {
    try {
        const { fileId } = req.params;
        const { description, tags } = req.body;
        
        const file = fileDatabase.find(f => f.id === fileId);
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        file.description = description || '';
        file.tags = tags || '';
        
        console.log(`✏️ Updated metadata for: ${file.originalName}`);
        res.json({ success: true, message: 'Metadata updated successfully' });
        
    } catch (error) {
        console.error('Update metadata error:', error);
        res.status(500).json({ error: 'Failed to update metadata' });
    }
});

// Delete specific version
app.delete('/api/files/:fileId/version', (req, res) => {
    try {
        const { fileId } = req.params;
        const fileIndex = fileDatabase.findIndex(f => f.id === fileId);
        
        if (fileIndex === -1) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        const file = fileDatabase[fileIndex];
        
        if (file.isLatest) {
            return res.status(400).json({ error: 'Cannot delete the latest version' });
        }
        
        // Delete from disk
        if (fs.existsSync(file.filePath)) {
            fs.unlinkSync(file.filePath);
        }
        
        // Remove from database
        fileDatabase.splice(fileIndex, 1);
        
        console.log(`🗑️ Deleted version: ${file.originalName}`);
        res.json({ success: true, message: 'Version deleted successfully' });
        
    } catch (error) {
        console.error('Delete version error:', error);
        res.status(500).json({ error: 'Failed to delete version' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        storage: 'In-Memory',
        files: fileDatabase.length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Simple File Sharing Server`);
    console.log(`📂 Server running on port ${PORT}`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
    console.log(`💾 Storage: In-Memory + Local Disk`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
});
