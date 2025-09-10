const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const mime = require('mime-types');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require('../config/firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();
const db = admin.firestore();

// Middleware
app.use(helmet());
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
const upload = multer({
  storage: multer.memoryStorage(),
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

    const file = req.file;
    const fileId = uuidv4();
    const timestamp = new Date().toISOString();
    const fileName = file.originalname;
    const fileExtension = path.extname(fileName);
    const baseName = path.basename(fileName, fileExtension);
    
    // Create a unique file path
    const filePath = `files/${baseName}/${fileId}_${timestamp}${fileExtension}`;
    
    // Upload to Firebase Storage
    const fileUpload = bucket.file(filePath);
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: fileName,
          uploadedAt: timestamp,
          fileId: fileId,
          version: '1.0'
        }
      }
    });

    stream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    });

    stream.on('finish', async () => {
      try {
        // Make file publicly readable
        await fileUpload.makePublic();
        
        // Get download URL
        const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
        
        // Save file metadata to Firestore
        const fileDoc = {
          fileId: fileId,
          originalName: fileName,
          filePath: filePath,
          downloadURL: downloadURL,
          mimeType: file.mimetype,
          size: file.size,
          uploadedAt: timestamp,
          version: 1,
          isLatest: true,
          baseName: baseName,
          tags: req.body.tags ? req.body.tags.split(',') : [],
          description: req.body.description || ''
        };
        
        await db.collection('files').doc(fileId).set(fileDoc);
        
        // Check if this is an update to existing file
        const existingFiles = await db.collection('files')
          .where('baseName', '==', baseName)
          .where('isLatest', '==', true)
          .get();
        
        if (!existingFiles.empty && existingFiles.docs.length > 1) {
          // Mark other versions as not latest
          const batch = db.batch();
          existingFiles.docs.forEach(doc => {
            if (doc.id !== fileId) {
              batch.update(doc.ref, { isLatest: false });
            }
          });
          await batch.commit();
        }
        
        res.json({
          success: true,
          fileId: fileId,
          downloadURL: downloadURL,
          message: 'File uploaded successfully'
        });
        
      } catch (error) {
        console.error('Firestore error:', error);
        res.status(500).json({ error: 'Database error' });
      }
    });

    stream.end(file.buffer);
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get all files
app.get('/api/files', async (req, res) => {
  try {
    const snapshot = await db.collection('files')
      .where('isLatest', '==', true)
      .orderBy('uploadedAt', 'desc')
      .get();
    
    const files = [];
    snapshot.forEach(doc => {
      files.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Get file versions
app.get('/api/files/:baseName/versions', async (req, res) => {
  try {
    const { baseName } = req.params;
    const snapshot = await db.collection('files')
      .where('baseName', '==', baseName)
      .orderBy('uploadedAt', 'desc')
      .get();
    
    const versions = [];
    snapshot.forEach(doc => {
      versions.push({ id: doc.id, ...doc.data() });
    });
    
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
    const fileDoc = await db.collection('files').doc(fileId).get();
    
    if (!fileDoc.exists) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileData = fileDoc.data();
    res.redirect(fileData.downloadURL);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Delete file
app.delete('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const fileDoc = await db.collection('files').doc(fileId).get();
    
    if (!fileDoc.exists) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileData = fileDoc.data();
    
    // Delete from Firebase Storage
    await bucket.file(fileData.filePath).delete();
    
    // Delete from Firestore
    await db.collection('files').doc(fileId).delete();
    
    res.json({ success: true, message: 'File deleted successfully' });
    
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Update file metadata (description and tags)
app.put('/api/files/:fileId/metadata', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { description, tags } = req.body;
    
    const fileDoc = await db.collection('files').doc(fileId).get();
    
    if (!fileDoc.exists) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Update metadata in Firestore
    await db.collection('files').doc(fileId).update({
      description: description || '',
      tags: tags || '',
      updatedAt: new Date().toISOString()
    });
    
    res.json({ success: true, message: 'Metadata updated successfully' });
    
  } catch (error) {
    console.error('Update metadata error:', error);
    res.status(500).json({ error: 'Failed to update metadata' });
  }
});

// Delete specific version
app.delete('/api/files/:fileId/version', async (req, res) => {
  try {
    const { fileId } = req.params;
    const fileDoc = await db.collection('files').doc(fileId).get();
    
    if (!fileDoc.exists) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileData = fileDoc.data();
    
    // Don't allow deletion of latest version
    if (fileData.isLatest) {
      return res.status(400).json({ error: 'Cannot delete the latest version' });
    }
    
    // Delete from Firebase Storage
    try {
      await bucket.file(fileData.filePath).delete();
    } catch (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }
    
    // Delete from Firestore
    await db.collection('files').doc(fileId).delete();
    
    res.json({ success: true, message: 'Version deleted successfully' });
    
  } catch (error) {
    console.error('Delete version error:', error);
    res.status(500).json({ error: 'Failed to delete version' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend available at http://localhost:${PORT}`);
});

module.exports = app;
