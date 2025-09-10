const { createClient } = require('@supabase/supabase-js');

class SupabaseFileService {
    constructor() {
        // Load environment variables from the correct path
        require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
        
        this.supabaseUrl = process.env.SUPABASE_URL || 'https://vdyuepooqnkwyxnjncva.supabase.co';
        this.supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeXVlcG9vcW5rd3l4bmpuY3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjY3NDQsImV4cCI6MjA3Mjc0Mjc0NH0.Vq71PYlP5x9KYYdPjCSmYUjp-5mCTaYhJAYdAeZXcNw';
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
        this.bucketName = process.env.STORAGE_BUCKET || 'construction-files';
        
        // Debug logging
        console.log('🔧 SupabaseService initialized with:');
        console.log('   URL:', this.supabaseUrl);
        console.log('   Key Type:', process.env.SUPABASE_SERVICE_KEY ? 'SERVICE_KEY' : 'ANON_KEY');
        console.log('   Key:', this.supabaseKey ? 'SET' : 'NOT SET');
        console.log('   Bucket:', this.bucketName);
    }

    // Upload file to Supabase Storage with Arabic filename support
    async uploadFile(file, fileName, userId, description = '', tags = '') {
        try {
            // Ensure proper UTF-8 encoding for Arabic filenames
            let cleanFileName = fileName;
            if (fileName && (fileName.includes('Ø') || fileName.includes('Ù') || fileName.includes('ÙØ'))) {
                try {
                    cleanFileName = Buffer.from(fileName, 'latin1').toString('utf8');
                    console.log('🔤 Fixed Arabic filename in service:', cleanFileName);
                } catch (error) {
                    console.log('⚠️ Filename UTF-8 conversion failed:', error);
                }
            }
            
            const fileExtension = cleanFileName.split('.').pop();
            const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
            const filePath = `uploads/${uniqueFileName}`;

            console.log(`📤 Uploading file to Supabase: ${filePath}`);

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

            // Save file metadata to database with proper UTF-8 filename
            const fileMetadata = {
                filename: cleanFileName, // Use the properly encoded filename
                file_path: filePath,
                file_size: file.size,
                content_type: file.mimetype,
                public_url: publicUrl,
                uploaded_by: userId || 'anonymous',
                uploaded_at: new Date().toISOString(),
                unique_filename: uniqueFileName,
                description: description || null,
                tags: tags ? (typeof tags === 'string' ? [tags] : tags) : null
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
                    
                    // Convert tags array back to comma-separated string for frontend
                    description: file.description,
                    tags: file.tags ? file.tags.join(', ') : null,
                    
                    // Keep other Supabase fields
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

    // Update file metadata (description and tags)
    async updateFileMetadata(fileId, description, tags) {
        try {
            console.log(`🔧 Updating metadata for file ${fileId}`);
            console.log(`🔧 Description: "${description}"`);
            console.log(`🔧 Tags: "${tags}"`);
            
            // First, let's check if the record exists
            const { data: existingRecord, error: selectError } = await this.supabase
                .from('files')
                .select('id, filename, description, tags')
                .eq('id', fileId)
                .single();
            
            if (selectError) {
                console.error('❌ Error finding record:', selectError);
                throw new Error(`Record with ID ${fileId} not found: ${selectError.message}`);
            }
            
            console.log(`🔧 Found existing record:`, existingRecord);
            
            // Process tags: convert string to array for text[] column
            let tagsArray = null;
            if (tags && tags.trim()) {
                // Split tags by comma and clean them
                tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            }
            
            const { data, error } = await this.supabase
                .from('files')
                .update({
                    description: description || null,
                    tags: tagsArray
                })
                .eq('id', fileId)
                .select(); // Return updated data

            if (error) {
                console.error('❌ Update metadata error:', error);
                console.error('❌ Error details:', JSON.stringify(error, null, 2));
                throw error;
            }

            if (!data || data.length === 0) {
                console.error('❌ No data returned from update - record may not exist');
                throw new Error('Update failed - no records updated');
            }

            console.log(`✅ Metadata updated successfully for file ${fileId}:`, data);
            return { success: true, data };

        } catch (error) {
            console.error('Update metadata service error:', error);
            throw error;
        }
    }

    // Delete specific version of a file
    async deleteFileVersion(fileId) {
        try {
            console.log(`Deleting file version ${fileId}`);

            // First get the file record to get the file path
            const { data: fileRecord, error: fetchError } = await this.supabase
                .from('files')
                .select('file_path, filename')
                .eq('id', fileId)
                .single();

            if (fetchError) {
                console.error('Fetch file record error:', fetchError);
                throw fetchError;
            }

            if (!fileRecord) {
                throw new Error('File not found');
            }

            // Delete from storage
            console.log(`Deleting from storage: ${fileRecord.file_path}`);
            const { error: storageError } = await this.supabase.storage
                .from(this.bucketName)
                .remove([fileRecord.file_path]);

            if (storageError) {
                console.error('Storage deletion error:', storageError);
                // Continue with database deletion even if storage fails
            }

            // Delete from database
            const { error: dbError } = await this.supabase
                .from('files')
                .delete()
                .eq('id', fileId);

            if (dbError) {
                console.error('Database deletion error:', dbError);
                throw dbError;
            }

            console.log(`File version ${fileId} deleted successfully`);
            return { success: true };

        } catch (error) {
            console.error('Delete file version service error:', error);
            throw error;
        }
    }
}

module.exports = SupabaseFileService;
