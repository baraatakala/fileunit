const { createClient } = require('@supabase/supabase-js');

class SupabaseFileService {
    constructor() {
        this.supabaseUrl = 'https://vdyuepooqnkwyxnjncva.supabase.co';
        this.supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key-here';
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
        this.bucketName = 'construction-files';
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

            // Ensure public URLs are still valid/refreshed
            const filesWithUrls = data.map(file => {
                const { data: { publicUrl } } = this.supabase.storage
                    .from(this.bucketName)
                    .getPublicUrl(file.file_path);

                return {
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
            // Get file info first
            const { data: fileData, error: fetchError } = await this.supabase
                .from('files')
                .select('file_path')
                .eq('id', fileId)
                .single();

            if (fetchError) throw fetchError;

            // Delete from storage
            const { error: storageError } = await this.supabase.storage
                .from(this.bucketName)
                .remove([fileData.file_path]);

            if (storageError) {
                console.warn('Storage delete error:', storageError);
            }

            // Delete from database
            const { error: dbError } = await this.supabase
                .from('files')
                .delete()
                .eq('id', fileId);

            if (dbError) throw dbError;

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
}

module.exports = SupabaseFileService;
