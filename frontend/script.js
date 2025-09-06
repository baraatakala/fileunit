class FileManager {
    constructor() {
        this.selectedFiles = [];
        this.currentUser = null;
        this.supabase = null;
        this.init();
        this.setupErrorHandling();
        this.initSupabase();
    }

    // Initialize Supabase client (frontend)
    async initSupabase() {
        try {
            // Import Supabase client (you'll need to include this via CDN or bundle)
            // For now, we'll use the backend API
            console.log('Supabase integration ready via backend API');
        } catch (error) {
            console.error('Supabase initialization error:', error);
        }
    }

    setupErrorHandling() {
        // Handle extension-related errors gracefully
        window.addEventListener('error', (event) => {
            // Ignore extension-related errors
            if (event.message && (
                event.message.includes('message channel closed') ||
                event.message.includes('Host validation failed') ||
                event.message.includes('Host is not supported')
            )) {
                event.preventDefault();
                return false;
            }
        });
        
        // Handle unhandled promise rejections from extensions
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.message && (
                event.reason.message.includes('message channel closed') ||
                event.reason.message.includes('Host validation failed') ||
                event.reason.message.includes('Host is not supported')
            )) {
                event.preventDefault();
                return false;
            }
        });

        // Override console methods to filter extension messages
        const originalConsoleInfo = console.info;
        const originalConsoleWarn = console.warn;
        const originalConsoleLog = console.log;

        console.info = function(...args) {
            const message = args.join(' ');
            if (message.includes('Host validation failed') || 
                message.includes('Host is not supported') ||
                message.includes('Host is not valid') ||
                message.includes('Host is not in insights whitelist') ||
                message.includes('READ - Host validation')) {
                return; // Suppress extension messages
            }
            originalConsoleInfo.apply(console, args);
        };

        console.warn = function(...args) {
            const message = args.join(' ');
            if (message.includes('Host validation failed') || 
                message.includes('Host is not supported') ||
                message.includes('Host is not valid') ||
                message.includes('Host is not in insights whitelist')) {
                return; // Suppress extension warnings
            }
            originalConsoleWarn.apply(console, args);
        };

        console.log = function(...args) {
            const message = args.join(' ');
            if (message.includes('Host validation failed') || 
                message.includes('Host is not supported') ||
                message.includes('Host is not valid') ||
                message.includes('Host is not in insights whitelist')) {
                return; // Suppress extension logs
            }
            originalConsoleLog.apply(console, args);
        };
    }

    init() {
        this.setupEventListeners();
        this.loadFiles();
    }

    setupEventListeners() {
        // File upload elements
        const fileDropZone = document.getElementById('fileDropZone');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');
        const uploadBtn = document.getElementById('uploadBtn');

        // File drop zone events
        fileDropZone.addEventListener('click', () => fileInput.click());
        fileDropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        fileDropZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        fileDropZone.addEventListener('drop', this.handleDrop.bind(this));

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(Array.from(e.target.files));
            // Reset file input to allow selecting the same file again
            e.target.value = '';
        });

        // Browse button
        browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        // Upload button
        uploadBtn.addEventListener('click', this.uploadFiles.bind(this));

        // Search and refresh
        document.getElementById('searchInput').addEventListener('input', this.handleSearch.bind(this));
        document.getElementById('refreshBtn').addEventListener('click', this.loadFiles.bind(this));

        // Modals
        document.getElementById('closeModal').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('closeVersionsModal').addEventListener('click', this.closeVersionsModal.bind(this));

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const fileModal = document.getElementById('fileModal');
            const versionsModal = document.getElementById('versionsModal');
            if (e.target === fileModal) {
                this.closeModal();
            }
            if (e.target === versionsModal) {
                this.closeVersionsModal();
            }
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('fileDropZone').classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('fileDropZone').classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('fileDropZone').classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        this.handleFileSelect(files);
    }

    handleFileSelect(files) {
        // Validate files
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (validFiles.length !== files.length) {
            this.showNotification('Some files were rejected due to invalid format or size', 'warning');
        }

        // Add to selected files (avoid duplicates)
        validFiles.forEach(file => {
            const exists = this.selectedFiles.some(f => 
                f.name === file.name && f.size === file.size
            );
            if (!exists) {
                this.selectedFiles.push(file);
            }
        });

        this.updateUploadQueue();
        this.updateUploadButton();
    }

    validateFile(file) {
        const maxSize = 500 * 1024 * 1024; // 500MB
        const allowedExtensions = ['.pdf', '.dwg', '.dxf', '.jpg', '.jpeg', '.png', '.zip', '.doc', '.docx', '.txt'];
        
        // Check size
        if (file.size > maxSize) {
            this.showNotification(`File ${file.name} exceeds 500MB limit`, 'error');
            return false;
        }

        // Check extension
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            this.showNotification(`File type ${extension} not supported`, 'error');
            return false;
        }

        return true;
    }

    updateUploadQueue() {
        const uploadQueue = document.getElementById('uploadQueue');
        uploadQueue.innerHTML = '';

        this.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="file-icon ${this.getFileIcon(file.name)}"></i>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${this.formatFileSize(file.size)} • ${file.type || 'Unknown type'}</p>
                    </div>
                </div>
                <button class="remove-file" onclick="fileManager.removeFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            uploadQueue.appendChild(fileItem);
        });
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updateUploadQueue();
        this.updateUploadButton();
    }

    updateUploadButton() {
        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.disabled = this.selectedFiles.length === 0;
    }

    async uploadFiles() {
        if (this.selectedFiles.length === 0) return;

        const progressSection = document.getElementById('progressSection');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const uploadBtn = document.getElementById('uploadBtn');

        // Show progress section
        progressSection.style.display = 'block';
        uploadBtn.disabled = true;

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < this.selectedFiles.length; i++) {
            const file = this.selectedFiles[i];
            const progress = ((i + 1) / this.selectedFiles.length) * 100;

            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Uploading ${file.name}... (${i + 1}/${this.selectedFiles.length})`;

            try {
                await this.uploadSingleFile(file);
                successCount++;
            } catch (error) {
                console.error('Upload failed:', error);
                errorCount++;
            }
        }

        // Hide progress section
        setTimeout(() => {
            progressSection.style.display = 'none';
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
        }, 2000);

        // Reset form
        this.selectedFiles = [];
        this.updateUploadQueue();
        this.updateUploadButton();
        document.getElementById('description').value = '';
        document.getElementById('tags').value = '';
        
        // Reset file input to ensure clean state
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = '';
        }

        // Show results
        if (successCount > 0) {
            this.showNotification(`${successCount} file(s) uploaded successfully`, 'success');
            this.loadFiles(); // Refresh file list
        }
        if (errorCount > 0) {
            this.showNotification(`${errorCount} file(s) failed to upload`, 'error');
        }

        uploadBtn.disabled = false;
    }

    async uploadSingleFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const description = document.getElementById('description').value;
        const tags = document.getElementById('tags').value;
        
        if (description) formData.append('description', description);
        if (tags) formData.append('tags', tags);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }

        return await response.json();
    }

    async loadFiles() {
        const filesGrid = document.getElementById('filesGrid');
        filesGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Loading files...</p></div>';

        try {
            const response = await fetch('/api/files');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to load files`);
            }

            const data = await response.json();
            console.log('Raw API response:', data); // Debug log
            
            // Handle different response formats with robust parsing
            let files = data;
            
            // Check for nested files property
            if (data && typeof data === 'object' && data.files) {
                files = data.files; // If API returns {files: [...]}
                console.log('Found nested files property:', files);
            }
            
            // Ensure we have a valid array or object to work with
            if (files === null || files === undefined) {
                console.warn('API returned null/undefined files, using empty array');
                files = [];
            } else if (typeof files === 'string') {
                console.warn('API returned string instead of array/object, parsing...');
                try {
                    files = JSON.parse(files);
                } catch (parseError) {
                    console.error('Could not parse files string:', parseError);
                    files = [];
                }
            } else if (typeof files !== 'object') {
                console.warn('API returned unexpected type:', typeof files, 'using empty array');
                files = [];
            }
            
            console.log('Pre-render files data:', { 
                type: typeof files, 
                isArray: Array.isArray(files), 
                data: files 
            });
            
            this.renderFiles(files);
        } catch (error) {
            console.error('Load files error:', error);
            filesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load files. Please try again.</p>
                </div>
            `;
        }
    }

    renderFiles(files, searchTerm = '') {
        const filesGrid = document.getElementById('filesGrid');
        
        // Debug logging for files parameter
        console.log('renderFiles called with:', {
            files: files,
            type: typeof files,
            isArray: Array.isArray(files),
            searchTerm: searchTerm
        });
        
        // Ensure files is always an array - multiple fallback strategies
        if (!files) {
            console.warn('Files is null/undefined, using empty array');
            files = [];
        } else if (!Array.isArray(files)) {
            console.warn('Files is not an array, attempting conversion:', typeof files);
            // Try to convert object to array (common with Firebase)
            if (typeof files === 'object' && files !== null) {
                if (files.length !== undefined) {
                    // Array-like object
                    files = Array.from(files);
                } else {
                    // Plain object - convert values to array
                    files = Object.values(files);
                }
            } else {
                // Fallback to empty array
                files = [];
            }
        }
        
        // Final safety check
        if (!Array.isArray(files)) {
            console.error('Could not convert files to array, using empty array. Original:', files);
            files = [];
        }
        
        console.log('Final files array for filtering:', files);
        
        // Filter files based on search term - handle different property names
        const filteredFiles = files.filter(file => {
            if (!file || typeof file !== 'object') return false;
            
            // Get filename from various possible properties
            const filename = file.originalName || file.filename || file.name || '';
            const description = file.description || '';
            const tags = file.tags || [];
            
            // Safely check if any field matches the search term
            return filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   (Array.isArray(tags) && tags.some(tag => 
                       typeof tag === 'string' && tag.toLowerCase().includes(searchTerm.toLowerCase())
                   ));
        });

        if (filteredFiles.length === 0) {
            filesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>${searchTerm ? 'No files match your search.' : 'No files uploaded yet.'}</p>
                </div>
            `;
            return;
        }

        filesGrid.innerHTML = filteredFiles.map(file => {
            // Handle different property names safely
            const filename = file.originalName || file.filename || file.name || 'Unknown File';
            const fileSize = file.size || file.file_size || 0;
            const uploadDate = file.uploadedAt || file.uploaded_at || file.created_at || new Date().toISOString();
            const version = file.version || '1.0';
            const description = file.description || '';
            const fileId = file.fileId || file.id || '';
            
            return `
            <div class="file-card">
                <div class="file-header">
                    <i class="file-card-icon ${this.getFileIcon(filename)}"></i>
                    <div class="file-card-info">
                        <h3>${filename}</h3>
                        <div class="file-meta">
                            <div>Size: ${this.formatFileSize(fileSize)}</div>
                            <div>Uploaded: ${this.formatDate(uploadDate)}</div>
                            <div>Version: ${version}</div>
                        </div>
                        ${description ? `<div class="file-description">${description}</div>` : ''}
                        ${file.tags && file.tags.length > 0 ? `
                            <div class="file-tags">
                                ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="file-actions">
                    <a href="/api/download/${fileId}" class="action-btn download-btn" target="_blank">
                        <i class="fas fa-download"></i> Download
                    </a>
                    <button class="action-btn versions-btn" onclick="fileManager.showVersions('${file.baseName || filename}')">
                        <i class="fas fa-history"></i> Versions
                    </button>
                    <button class="action-btn delete-btn" onclick="fileManager.deleteFile('${fileId}', '${filename}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }

    async showVersions(baseName) {
        const versionsModal = document.getElementById('versionsModal');
        const versionsModalBody = document.getElementById('versionsModalBody');
        
        versionsModalBody.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Loading versions...</p></div>';
        versionsModal.style.display = 'block';

        try {
            const response = await fetch(`/api/files/${encodeURIComponent(baseName)}/versions`);
            if (!response.ok) {
                throw new Error('Failed to load versions');
            }

            const versions = await response.json();
            
            versionsModalBody.innerHTML = versions.map(version => `
                <div class="version-item">
                    <div class="version-info">
                        <h4>${version.originalName}</h4>
                        <p>Uploaded: ${this.formatDate(version.uploadedAt)}</p>
                        <p>Size: ${this.formatFileSize(version.size)}</p>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${version.isLatest ? '<span class="version-badge latest">Latest</span>' : '<span class="version-badge">v' + version.version + '</span>'}
                        <a href="/api/download/${version.fileId}" class="action-btn download-btn" target="_blank">
                            <i class="fas fa-download"></i>
                        </a>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Load versions error:', error);
            versionsModalBody.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load versions. Please try again.</p>
                </div>
            `;
        }
    }

    async deleteFile(fileId, fileName) {
        if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/files/${fileId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            this.showNotification('File deleted successfully', 'success');
            this.loadFiles(); // Refresh file list
            
        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification('Failed to delete file', 'error');
        }
    }

    handleSearch(e) {
        const searchTerm = e.target.value;
        // Re-render files with search filter
        // For now, we'll reload files - in a real app you might want to cache them
        this.loadFiles().then(() => {
            // Get current files and filter them
            fetch('/api/files')
                .then(response => response.json())
                .then(files => this.renderFiles(files, searchTerm))
                .catch(console.error);
        });
    }

    closeModal() {
        document.getElementById('fileModal').style.display = 'none';
    }

    closeVersionsModal() {
        document.getElementById('versionsModal').style.display = 'none';
    }

    getFileIcon(filename) {
        if (!filename || typeof filename !== 'string') {
            return 'fas fa-file'; // Default icon
        }
        const extension = filename.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'pdf':
                return 'fas fa-file-pdf';
            case 'dwg':
            case 'dxf':
                return 'fas fa-drafting-compass';
            case 'jpg':
            case 'jpeg':
            case 'png':
                return 'fas fa-image';
            case 'zip':
            case 'rar':
                return 'fas fa-file-archive';
            case 'doc':
            case 'docx':
                return 'fas fa-file-word';
            case 'txt':
                return 'fas fa-file-alt';
            default:
                return 'fas fa-file';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 10000;
                max-width: 300px;
                word-wrap: break-word;
            ">
                ${message}
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Initialize the file manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.fileManager = new FileManager();
});

// Make fileManager globally accessible for onclick handlers
window.fileManager = null;
