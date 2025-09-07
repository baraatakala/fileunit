const { createClient } = require('@supabase/supabase-js');

class SupabaseFileService {
    constructor() {
        // Load environment variables from the correct path
        require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
        
        this.supabaseUrl = process.env.SUPABASE_URL || 'https://vdyuepooqnkwyxnjncva.supabase.co';
        this.supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeXVlcG9vcW5rd3l4bmpuY3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjY3NDQsImV4cCI6MjA3Mjc0Mjc0NH0.Vq71PYlP5x9KYYdPjCSmYUjp-5mCTaYhJAYdAeZXcNw';
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
        this.bucketName = process.env.STORAGE_BUCKET || 'construction-files';
        
        // Debug logging
        console.log('🔧 SupabaseService initialized with:');
        console.log('   URL:', this.supabaseUrl);
        console.log('   Key:', this.supabaseKey ? 'SET' : 'NOT SET');
        console.log('   Bucket:', this.bucketName);
    }

    // Upload file to Supabase Storage
    async uploadFile(file, fileName, userId) {
        try {
            const fileExtension = fileName.split('.').pop();
            const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
            const filePath = `uploads/${uniqueFileName}`;

            console.log(`Uploading file to Supabase: ${filePath}`);

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from(this.bucketName)
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw uploadError;
            }

            console.log('Upload successful:', uploadData);

            // Get public URL
            const { data: { publicUrl } } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            // Save file metadata to database
            const fileMetadata = {
                filename: fileName,
                file_path: filePath,
                file_size: file.size,
                content_type: file.mimetype,
                public_url: publicUrl,
                uploaded_by: userId || 'anonymous',
                uploaded_at: new Date().toISOString(),
                unique_filename: uniqueFileName
            };

            const { data: dbData, error: dbError } = await this.supabase
                .from('files')
                .insert([fileMetadata])
                .select();

            if (dbError) {
                console.error('Database error:', dbError);
                // If DB insert fails, try to delete the uploaded file
                await this.supabase.storage
                    .from(this.bucketName)
                    .remove([filePath]);
                throw dbError;
            }

            console.log('File metadata saved:', dbData);

            return {
                success: true,
                file: dbData[0],
                publicUrl: publicUrl
            };

        } catch (error) {
            console.error('Upload service error:', error);
            throw error;
        }
    }

    // Get all files from database
    async getFiles() {
        try {
            console.log('Fetching files from Supabase database...');

            const { data, error } = await this.supabase
                .from('files')
                .select('*')
                .order('uploaded_at', { ascending: false });

            if (error) {
                console.error('Database fetch error:', error);
                throw error;
            }

            console.log(`Found ${data.length} files in database`);

            // Group files by filename to handle versions
            const fileGroups = {};
            data.forEach(file => {
                const filename = file.filename;
                if (!fileGroups[filename]) {
                    fileGroups[filename] = [];
                }
                fileGroups[filename].push(file);
            });

            // Get only the latest version of each file for the main list
            const latestFiles = Object.keys(fileGroups).map(filename => {
                const versions = fileGroups[filename].sort((a, b) => 
                    new Date(b.uploaded_at) - new Date(a.uploaded_at)
                );
                const latestFile = versions[0];
                
                // Add version info
                latestFile.version = `${versions.length}.0`;
                latestFile.baseName = filename;
                latestFile.totalVersions = versions.length;
                
                return latestFile;
            });

            // Ensure public URLs are still valid/refreshed
            const filesWithUrls = latestFiles.map(file => {
                const { data: { publicUrl } } = this.supabase.storage
                    .from(this.bucketName)
                    .getPublicUrl(file.file_path);

                return {
                    // Frontend expected fields
                    fileId: file.id,
                    originalName: file.filename,
                    uploadedAt: file.uploaded_at,
                    size: file.file_size,
                    
                    // Keep all Supabase fields too
                    ...file,
                    public_url: publicUrl
                };
            });

            return filesWithUrls;

        } catch (error) {
            console.error('Get files service error:', error);
            throw error;
        }
    }

    // Delete file from storage and database
    async deleteFile(fileId) {
        try {
            console.log('Deleting file with ID:', fileId);
            
            // Get file info first (without .single() to avoid errors)
            const { data: fileData, error: fetchError } = await this.supabase
                .from('files')
                .select('file_path')
                .eq('id', fileId);

            if (fetchError) {
                console.error('Fetch error:', fetchError);
                throw fetchError;
            }

            // Check if file exists
            if (!fileData || fileData.length === 0) {
                console.log('File not found in database, proceeding with database cleanup only');
            } else {
                // Delete from storage
                const filePath = fileData[0].file_path;
                console.log('Deleting from storage:', filePath);
                
                const { error: storageError } = await this.supabase.storage
                    .from(this.bucketName)
                    .remove([filePath]);

                if (storageError) {
                    console.warn('Storage delete error:', storageError);
                }
            }

            // Delete from database (always try this)
            console.log('Deleting from database...');
            const { error: dbError } = await this.supabase
                .from('files')
                .delete()
                .eq('id', fileId);

            if (dbError) {
                console.error('Database delete error:', dbError);
                throw dbError;
            }

            console.log('File deleted successfully');
            return { success: true };

        } catch (error) {
            console.error('Delete service error:', error);
            throw error;
        }
    }

    // Get file download URL
    async getDownloadUrl(filePath) {
        try {
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .createSignedUrl(filePath, 3600); // 1 hour expiry

            if (error) throw error;

            return data.signedUrl;

        } catch (error) {
            console.error('Get download URL error:', error);
            throw error;
        }
    }

    // Get file versions by base filename
    async getFileVersions(baseName) {
        try {
            console.log('Fetching versions for:', baseName);

            const { data, error } = await this.supabase
                .from('files')
                .select('*')
                .eq('filename', baseName)
                .order('uploaded_at', { ascending: false });

            if (error) {
                console.error('Database fetch versions error:', error);
                throw error;
            }

            console.log(`Found ${data.length} versions for ${baseName}`);

            // Map Supabase data to frontend expected format
            const versionsWithUrls = data.map((file, index) => {
                const { data: { publicUrl } } = this.supabase.storage
                    .from(this.bucketName)
                    .getPublicUrl(file.file_path);

                return {
                    // Frontend expected fields
                    fileId: file.id,
                    originalName: file.filename,
                    uploadedAt: file.uploaded_at,
                    size: file.file_size,
                    version: `${data.length - index}.0`,
                    baseName: baseName,
                    isLatest: index === 0,
                    
                    // Keep Supabase fields too
                    ...file,
                    public_url: publicUrl
                };
            });

            return versionsWithUrls;

        } catch (error) {
            console.error('Get file versions service error:', error);
            throw error;
        }
    }
}

module.exports = SupabaseFileService;
