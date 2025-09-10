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
        this.initTheme();
        this.initView();
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

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', this.handleSearch.bind(this));
        document.getElementById('clearSearchBtn').addEventListener('click', this.clearSearch.bind(this));
        document.getElementById('fileTypeFilter').addEventListener('change', this.handleFilter.bind(this));
        document.getElementById('sortBy').addEventListener('change', this.handleSort.bind(this));
        document.getElementById('sizeFilter').addEventListener('change', this.handleFilter.bind(this));
        document.getElementById('filterToggleBtn').addEventListener('click', this.toggleFilters.bind(this));
        document.getElementById('refreshBtn').addEventListener('click', this.loadFiles.bind(this));

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', this.toggleTheme.bind(this));

        // View controls
        document.getElementById('gridViewBtn').addEventListener('click', () => this.switchView('grid'));
        document.getElementById('listViewBtn').addEventListener('click', () => this.switchView('list'));

        // Character counters for description and tags
        const descriptionTextarea = document.getElementById('description');
        const tagsInput = document.getElementById('tags');
        const descriptionCount = document.getElementById('descriptionCount');
        const tagsCount = document.getElementById('tagsCount');

        if (descriptionTextarea && descriptionCount) {
            descriptionTextarea.addEventListener('input', (e) => {
                const length = e.target.value.length;
                descriptionCount.textContent = `${length}/500`;
                if (length > 450) {
                    descriptionCount.style.color = '#e74c3c';
                } else if (length > 400) {
                    descriptionCount.style.color = '#f39c12';
                } else {
                    descriptionCount.style.color = '#7f8c8d';
                }
            });
        }

        if (tagsInput && tagsCount) {
            tagsInput.addEventListener('input', (e) => {
                const length = e.target.value.length;
                tagsCount.textContent = `${length}/100`;
                if (length > 90) {
                    tagsCount.style.color = '#e74c3c';
                } else if (length > 80) {
                    tagsCount.style.color = '#f39c12';
                } else {
                    tagsCount.style.color = '#7f8c8d';
                }
            });
        }

        // Modals
        document.getElementById('closeModal').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('closeVersionsModal').addEventListener('click', this.closeVersionsModal.bind(this));
        document.getElementById('closePreviewModal').addEventListener('click', this.closePreviewModal.bind(this));
        
        // Help modal
        document.getElementById('helpToggle').addEventListener('click', this.showHelpModal.bind(this));
        document.getElementById('closeHelpModal').addEventListener('click', this.closeHelpModal.bind(this));

        // Preview controls
        document.getElementById('zoomInBtn').addEventListener('click', this.zoomIn.bind(this));
        document.getElementById('zoomOutBtn').addEventListener('click', this.zoomOut.bind(this));
        document.getElementById('resetZoomBtn').addEventListener('click', this.resetZoom.bind(this));
        document.getElementById('fullscreenBtn').addEventListener('click', this.toggleFullscreen.bind(this));
        document.getElementById('previewDownloadBtn').addEventListener('click', this.downloadFromPreview.bind(this));

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const fileModal = document.getElementById('fileModal');
            const versionsModal = document.getElementById('versionsModal');
            const previewModal = document.getElementById('previewModal');
            if (e.target === fileModal) {
                this.closeModal();
            }
            if (e.target === versionsModal) {
                this.closeVersionsModal();
            }
            if (e.target === previewModal) {
                this.closePreviewModal();
            }
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = document.getElementById('fileDropZone');
        dropZone.classList.add('drag-over');
        
        // Show preview of what will be uploaded
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const validCount = Array.from(files).filter(file => this.validateFile(file)).length;
            const invalidCount = files.length - validCount;
            
            let message = `Drop to upload ${validCount} file${validCount !== 1 ? 's' : ''}`;
            if (invalidCount > 0) {
                message += ` (${invalidCount} invalid)`;
            }
            
            const preview = dropZone.querySelector('.drag-preview') || document.createElement('div');
            preview.className = 'drag-preview';
            preview.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>${message}</p>
            `;
            
            if (!dropZone.querySelector('.drag-preview')) {
                dropZone.appendChild(preview);
            }
        }
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Only remove drag state if really leaving the drop zone
        if (!e.currentTarget.contains(e.relatedTarget)) {
            const dropZone = document.getElementById('fileDropZone');
            dropZone.classList.remove('drag-over');
            
            // Remove preview
            const preview = dropZone.querySelector('.drag-preview');
            if (preview) {
                preview.remove();
            }
        }
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = document.getElementById('fileDropZone');
        dropZone.classList.remove('drag-over');
        
        // Remove preview
        const preview = dropZone.querySelector('.drag-preview');
        if (preview) {
            preview.remove();
        }
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) {
            this.showNotification('No files detected', 'error');
            return;
        }
        
        this.handleFileSelect(files);
    }

    // Enhanced file validation
    validateFile(file) {
        const maxSize = 500 * 1024 * 1024; // 500MB
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
            'application/acad',
            'application/x-autocad',
            'image/vnd.dwg',
            'image/x-dwg',
            'application/dwg',
            'application/x-dwg',
            'drawing/dwg',
            'image/vnd.dxf',
            'application/dxf',
            
            // Archives
            'application/zip',
            'application/x-rar-compressed',
            'application/x-7z-compressed',
            
            // Spreadsheets
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            
            // Presentations
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];

        // Check file size
        if (file.size > maxSize) {
            this.showNotification(`File "${file.name}" is too large. Maximum size is 500MB.`, 'error');
            return false;
        }

        // Check file type (also check extension for CAD files)
        const fileName = file.name.toLowerCase();
        const hasValidExtension = fileName.endsWith('.pdf') || fileName.endsWith('.dwg') || 
                                fileName.endsWith('.dxf') || fileName.endsWith('.jpg') || 
                                fileName.endsWith('.jpeg') || fileName.endsWith('.png') || 
                                fileName.endsWith('.zip') || fileName.endsWith('.doc') || 
                                fileName.endsWith('.docx') || fileName.endsWith('.txt') ||
                                fileName.endsWith('.gif') || fileName.endsWith('.webp') ||
                                fileName.endsWith('.rar') || fileName.endsWith('.7z') ||
                                fileName.endsWith('.xls') || fileName.endsWith('.xlsx') ||
                                fileName.endsWith('.ppt') || fileName.endsWith('.pptx');

        const hasValidMimeType = allowedTypes.includes(file.type);

        if (!hasValidExtension && !hasValidMimeType) {
            this.showNotification(`File "${file.name}" has an unsupported format.`, 'error');
            return false;
        }

        return true;
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
        const allowedExtensions = [
            '.pdf', '.dwg', '.dxf', '.jpg', '.jpeg', '.png', '.gif', '.webp', 
            '.zip', '.rar', '.7z', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx'
        ];
        
        // Check size
        if (file.size > maxSize) {
            // Support Arabic error messages
            this.showNotification(`الملف "${file.name}" كبير جداً (أكثر من 500 ميجابايت) / File "${file.name}" exceeds 500MB limit`, 'error');
            return false;
        }

        // Check extension with proper Unicode support
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            const supportedTypes = 'PDF, DWG, DXF, Images, Excel (XLS/XLSX), Word, PowerPoint, ZIP';
            this.showNotification(`نوع الملف "${extension}" غير مدعوم / File type "${extension}" not supported. Supported: ${supportedTypes}`, 'error');
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
        
        // Ensure proper encoding for Arabic filenames
        console.log('📤 Original filename:', file.name);
        
        // Create a new file object with proper UTF-8 encoding if needed
        let processedFile = file;
        if (file.name && (file.name.includes('Ø') || file.name.includes('Ù'))) {
            console.log('🔤 Detected corrupted Arabic filename, attempting fix...');
            try {
                // Create new file with corrected name
                const properName = this.fixArabicFilename(file.name);
                processedFile = new File([file], properName, { type: file.type });
                console.log('✅ Fixed filename:', properName);
            } catch (error) {
                console.log('⚠️ Filename fix failed:', error);
            }
        }
        
        formData.append('file', processedFile);
        
        const description = document.getElementById('description').value;
        const tags = document.getElementById('tags').value;
        
        if (description) formData.append('description', description);
        if (tags) formData.append('tags', tags);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            // Ensure proper encoding
            headers: {
                'Accept': 'application/json',
                // Don't set Content-Type, let browser set it with boundary for FormData
            }
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
            
            // Store current files for filtering
            this.currentFiles = files;
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
        
        // Apply advanced filters
        let filteredFiles = this.applyFilters(files, searchTerm);
        
        // Apply sorting
        filteredFiles = this.applySorting(filteredFiles);
        
        // Update statistics
        this.updateFileStats(filteredFiles, files.length);

        if (filteredFiles.length === 0) {
            const hasFilters = searchTerm || this.hasActiveFilters();
            filesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-${hasFilters ? 'search' : 'folder-open'}"></i>
                    <h3>${hasFilters ? 'لا توجد نتائج / No Results' : 'لا توجد ملفات / No Files Yet'}</h3>
                    <p>${hasFilters ? 'جرب تعديل البحث أو المرشحات / Try adjusting your search or filters' : 'ابدأ برفع الملفات / Start by uploading some files'}</p>
                    ${hasFilters ? '<button class="action-btn" onclick="fileManager.clearAllFilters()"><i class="fas fa-times"></i> Clear Filters</button>' : ''}
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
            
            // Handle tags - they might be stored as JSON string
            let tags = file.tags || [];
            if (typeof tags === 'string') {
                try {
                    tags = JSON.parse(tags);
                } catch (e) {
                    // If not JSON, treat as comma-separated string
                    tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                }
            }
            if (!Array.isArray(tags)) {
                tags = [];
            }
            
            return `
            <div class="file-card" data-file-id="${fileId}">
                <div class="file-header">
                    <i class="file-card-icon ${this.getFileIcon(filename)}"></i>
                    <div class="file-card-info">
                        <h3 class="file-name" title="${filename}">${filename}</h3>
                        <div class="file-meta">
                            <div class="meta-item">
                                <i class="fas fa-weight-hanging"></i>
                                <span>${this.formatFileSize(fileSize)}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-calendar"></i>
                                <span>${this.formatDate(uploadDate)}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-code-branch"></i>
                                <span>v${version}</span>
                            </div>
                        </div>
                        ${description ? `<div class="file-description">
                            <i class="fas fa-align-left"></i>
                            <span>${description}</span>
                        </div>` : ''}
                        ${tags.length > 0 ? `
                            <div class="file-tags">
                                <i class="fas fa-tags"></i>
                                <div class="tags-container">
                                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="file-actions">
                    <button class="action-btn preview-action-btn" onclick="fileManager.previewFile('${fileId}', '${filename}', '${file.mimetype || ''}')" title="Preview file">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn download-btn" onclick="fileManager.downloadFile('${fileId}', '${filename}')" title="Download file">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="action-btn versions-btn" onclick="fileManager.showVersions('${file.baseName || filename}')" title="View versions">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="fileManager.deleteFile('${fileId}', '${filename}')" title="Delete file">
                        <i class="fas fa-trash"></i>
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
        versionsModal.classList.add('show');

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
                        <p><i class="fas fa-calendar"></i> Uploaded: ${this.formatDate(version.uploadedAt)}</p>
                        <p><i class="fas fa-hdd"></i> Size: ${this.formatFileSize(version.size)}</p>
                        ${version.description ? `<p><strong>Description:</strong> ${version.description}</p>` : ''}
                        ${version.tags ? `<p><strong>Tags:</strong> ${Array.isArray(version.tags) ? version.tags.join(', ') : version.tags}</p>` : ''}
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${version.isLatest ? '<span class="version-badge latest">Latest</span>' : '<span class="version-badge">v' + version.version + '</span>'}
                        <button class="action-btn download-btn" onclick="fileManager.downloadFile('${version.fileId}', '${version.originalName}')" title="Download this version">
                            <i class="fas fa-download"></i>
                        </button>
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



    async downloadFile(fileId, filename) {
        try {
            // For Arabic filenames, use fetch with proper blob handling
            if (filename && /[\u0600-\u06FF\u0750-\u077F]/.test(filename)) {
                await this.downloadArabicFile(fileId, filename);
                return;
            }
            
            // Standard download for non-Arabic filenames
            const downloadUrl = `/api/download/${fileId}`;
            
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename || 'download';
            link.style.display = 'none';
            
            // Add to DOM, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Download error:', error);
            this.showMessage('Failed to download file: ' + error.message, 'error');
        }
    }

    // Special download handling for Arabic filenames
    async downloadArabicFile(fileId, filename) {
        try {
            console.log('🔽 Downloading Arabic file:', filename);
            
            const response = await fetch(`/api/download/${fileId}`, {
                method: 'GET',
                headers: {
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get the file blob
            const blob = await response.blob();
            
            // Create object URL and download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up object URL
            window.URL.revokeObjectURL(url);
            
            console.log('✅ Arabic file download completed:', filename);
            
        } catch (error) {
            console.error('Arabic download error:', error);
            throw error;
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
        document.getElementById('versionsModal').classList.remove('show');
    }

    // Preview Modal Methods
    async previewFile(fileId, filename, mimetype = '') {
        const previewModal = document.getElementById('previewModal');
        const previewModalTitle = document.getElementById('previewModalTitle');
        const previewModalBody = document.getElementById('previewModalBody');
        const previewFileInfo = document.getElementById('previewFileInfo');
        
        // Store current file info for download
        this.currentPreviewFile = { fileId, filename };
        
        // Set modal title and info
        previewModalTitle.textContent = `Preview: ${filename}`;
        previewFileInfo.textContent = `${filename} • ${this.formatFileSize(0)}`;
        
        // Show loading
        previewModalBody.innerHTML = `
            <div class="preview-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading preview...</p>
            </div>
        `;
        
        // Show modal
        previewModal.classList.add('show');
        previewModal.style.display = 'block';
        
        try {
            // Determine file type and show appropriate preview
            const fileExtension = filename.split('.').pop().toLowerCase();
            
            if (this.isImageFile(fileExtension)) {
                await this.previewImage(fileId, filename);
            } else if (this.isPdfFile(fileExtension)) {
                await this.previewPdf(fileId, filename);
            } else if (this.isTextFile(fileExtension)) {
                await this.previewText(fileId, filename);
            } else if (this.isExcelFile(fileExtension)) {
                await this.previewExcel(fileId, filename);
            } else if (this.isCadFile(fileExtension)) {
                await this.previewCad(fileId, filename);
            } else {
                this.showUnsupportedPreview(filename, fileExtension);
            }
        } catch (error) {
            console.error('Preview error:', error);
            this.showPreviewError(filename, error.message);
        }
    }

    closePreviewModal() {
        const previewModal = document.getElementById('previewModal');
        previewModal.classList.remove('show', 'fullscreen');
        previewModal.style.display = 'none';
        
        // Reset zoom
        this.currentZoom = 1;
        this.currentPreviewFile = null;
        
        // Clean up any iframes or large content
        const previewModalBody = document.getElementById('previewModalBody');
        previewModalBody.innerHTML = '';
    }

    async previewImage(fileId, filename) {
        const previewModalBody = document.getElementById('previewModalBody');
        
        try {
            // Use preview endpoint for inline display
            const previewUrl = `/api/preview/${fileId}`;
            
            previewModalBody.innerHTML = `
                <div class="preview-container">
                    <div class="preview-type-indicator">
                        <i class="fas fa-image"></i> Image
                    </div>
                    <div class="zoom-container">
                        <div class="zoom-info" id="zoomInfo">100%</div>
                        <img class="preview-image zoomable" src="${previewUrl}" alt="${filename}" 
                             onload="this.style.opacity='1'" 
                             onerror="fileManager.showPreviewError('${filename}', 'Failed to load image')"
                             style="opacity: 0; transition: opacity 0.3s ease;">
                    </div>
                </div>
            `;
            
            // Add pan and zoom functionality
            this.addImageInteractivity();
            
            // Update file info with actual size
            await this.updatePreviewFileInfo(fileId, filename);
            
        } catch (error) {
            this.showPreviewError(filename, error.message);
        }
    }

    async previewPdf(fileId, filename) {
        const previewModalBody = document.getElementById('previewModalBody');
        
        try {
            // Use preview endpoint for inline display
            const previewUrl = `/api/preview/${fileId}`;
            
            previewModalBody.innerHTML = `
                <div class="preview-container">
                    <div class="preview-type-indicator">
                        <i class="fas fa-file-pdf"></i> PDF
                    </div>
                    <iframe class="preview-pdf" src="${previewUrl}" type="application/pdf">
                        <div class="preview-error">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h3>PDF Preview Not Available</h3>
                            <p>Your browser doesn't support PDF preview. Please download to view.</p>
                            <button class="action-btn download-btn" onclick="fileManager.downloadFile('${fileId}', '${filename}')">
                                <i class="fas fa-download"></i> Download PDF
                            </button>
                        </div>
                    </iframe>
                </div>
            `;
            
            // Update file info with actual size
            await this.updatePreviewFileInfo(fileId, filename);
        } catch (error) {
            this.showPreviewError(filename, error.message);
        }
    }

    async previewText(fileId, filename) {
        const previewModalBody = document.getElementById('previewModalBody');
        
        try {
            const response = await fetch(`/api/download/${fileId}`);
            if (!response.ok) throw new Error('Failed to load file');
            
            const text = await response.text();
            const truncatedText = text.length > 10000 ? text.substring(0, 10000) + '\n\n... (File truncated for preview. Download to see full content)' : text;
            
            previewModalBody.innerHTML = `
                <div class="preview-container">
                    <div class="preview-type-indicator">
                        <i class="fas fa-file-alt"></i> Text
                    </div>
                    <pre class="preview-document">${this.escapeHtml(truncatedText)}</pre>
                </div>
            `;
        } catch (error) {
            this.showPreviewError(filename, error.message);
        }
    }

    async previewExcel(fileId, filename) {
        const previewModalBody = document.getElementById('previewModalBody');
        const fileExtension = filename.split('.').pop().toLowerCase();
        
        // For Excel files, show info and suggest tools
        previewModalBody.innerHTML = `
            <div class="preview-container">
                <div class="preview-type-indicator">
                    <i class="fas fa-file-excel"></i> Excel File
                </div>
                <div class="preview-cad"> 
                    <i class="fas fa-file-excel" style="color: #217346;"></i>
                    <h3>${fileExtension.toUpperCase()} Spreadsheet Preview</h3>
                    <p>Excel files contain spreadsheet data, calculations, and charts. Best viewed in spreadsheet software.</p>
                    
                    <div class="cad-info-grid">
                        <div class="cad-info-item">
                            <strong>ملف إكسل / File Type</strong>
                            ${fileExtension.toUpperCase()} - Microsoft Excel Spreadsheet
                        </div>
                        <div class="cad-info-item">
                            <strong>البرامج المستخدمة / Recommended Software</strong>
                            Microsoft Excel, LibreOffice Calc, Google Sheets
                        </div>
                        <div class="cad-info-item">
                            <strong>المحتويات / Contains</strong>
                            Data tables, formulas, charts, calculations
                        </div>
                        <div class="cad-info-item">
                            <strong>الاستخدام / Industry Use</strong>
                            Project management, cost estimation, schedules
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <button class="action-btn download-btn" onclick="fileManager.downloadFile('${fileId}', '${filename}')" style="font-size: 1.1rem; padding: 12px 24px;">
                            <i class="fas fa-download"></i> تحميل للعرض / Download to View
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async previewCad(fileId, filename) {
        const previewModalBody = document.getElementById('previewModalBody');
        const fileExtension = filename.split('.').pop().toLowerCase();
        
        // For CAD files, show info and suggest tools
        previewModalBody.innerHTML = `
            <div class="preview-container">
                <div class="preview-type-indicator">
                    <i class="fas fa-drafting-compass"></i> CAD File
                </div>
                <div class="preview-cad">
                    <i class="fas fa-drafting-compass"></i>
                    <h3>${fileExtension.toUpperCase()} File Preview</h3>
                    <p>ملفات الكاد تتطلب برامج متخصصة للعرض. يحتوي هذا الملف على رسومات تقنية وتصاميم. / CAD files require specialized software for viewing. This file contains technical drawings and designs.</p>
                    
                    <div class="cad-info-grid">
                        <div class="cad-info-item">
                            <strong>نوع الملف / File Type</strong>
                            ${fileExtension.toUpperCase()} - Computer Aided Design
                        </div>
                        <div class="cad-info-item">
                            <strong>البرامج المُوصى بها / Recommended Software</strong>
                            AutoCAD, DraftSight, FreeCAD, LibreCAD
                        </div>
                        <div class="cad-info-item">
                            <strong>المحتويات / Contains</strong>
                            Technical drawings, blueprints, 2D/3D models
                        </div>
                        <div class="cad-info-item">
                            <strong>الاستخدام / Industry Use</strong>
                            Architecture, Engineering, Construction
                        </div>
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <button class="action-btn download-btn" onclick="fileManager.downloadFile('${fileId}', '${filename}')" style="font-size: 1.1rem; padding: 12px 24px;">
                            <i class="fas fa-download"></i> تحميل للعرض / Download to View
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showUnsupportedPreview(filename, extension) {
        const previewModalBody = document.getElementById('previewModalBody');
        
        previewModalBody.innerHTML = `
            <div class="preview-container">
                <div class="preview-error">
                    <i class="fas fa-file"></i>
                    <h3>Preview Not Available</h3>
                    <p>المعاينة غير متوفرة لملفات .${extension} / Preview is not supported for .${extension} files.</p>
                    <p>الصيغ المدعومة / Supported formats: Images (JPG, PNG, GIF), PDF, Text files, Excel (XLS, XLSX), CAD files (DWG, DXF)</p>
                    <button class="action-btn download-btn" onclick="fileManager.downloadFromPreview()">
                        <i class="fas fa-download"></i> Download File
                    </button>
                </div>
            </div>
        `;
    }

    showPreviewError(filename, errorMessage) {
        const previewModalBody = document.getElementById('previewModalBody');
        
        previewModalBody.innerHTML = `
            <div class="preview-container">
                <div class="preview-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Preview Error</h3>
                    <p>Unable to preview "${filename}"</p>
                    <p class="error-details">${errorMessage}</p>
                    <button class="action-btn download-btn" onclick="fileManager.downloadFromPreview()">
                        <i class="fas fa-download"></i> Download File
                    </button>
                </div>
            </div>
        `;
    }

    // Preview utility methods
    isImageFile(extension) {
        return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension);
    }

    isPdfFile(extension) {
        return extension === 'pdf';
    }

    isTextFile(extension) {
        return ['txt', 'md', 'json', 'xml', 'csv', 'log'].includes(extension);
    }

    isExcelFile(extension) {
        return ['xls', 'xlsx'].includes(extension);
    }

    isCadFile(extension) {
        return ['dwg', 'dxf'].includes(extension);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Zoom and pan functionality
    currentZoom = 1;
    minZoom = 0.1;
    maxZoom = 5;
    
    addImageInteractivity() {
        const img = document.querySelector('.preview-image');
        if (!img) return;
        
        let isDragging = false;
        let startX, startY, translateX = 0, translateY = 0;
        
        // Mouse wheel zoom
        img.parentElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoomImage(delta, e.clientX, e.clientY);
        });
        
        // Touch zoom (pinch)
        let initialDistance = 0;
        img.parentElement.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        });
        
        img.parentElement.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                this.zoomImage(scale, 0, 0);
                initialDistance = currentDistance;
            }
        });
        
        // Drag functionality
        img.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            img.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${this.currentZoom})`;
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            if (img) img.style.cursor = 'grab';
        });
    }

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    zoomImage(delta, clientX = 0, clientY = 0) {
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.currentZoom * delta));
        if (newZoom === this.currentZoom) return;
        
        this.currentZoom = newZoom;
        const img = document.querySelector('.preview-image');
        const zoomInfo = document.getElementById('zoomInfo');
        
        if (img) {
            img.style.transform = `translate(0, 0) scale(${this.currentZoom})`;
            img.style.transformOrigin = 'center center';
        }
        
        if (zoomInfo) {
            zoomInfo.textContent = `${Math.round(this.currentZoom * 100)}%`;
        }
    }

    // Zoom control methods
    zoomIn() {
        this.zoomImage(1.2);
    }

    zoomOut() {
        this.zoomImage(0.8);
    }

    resetZoom() {
        this.currentZoom = 1;
        const img = document.querySelector('.preview-image');
        const zoomInfo = document.getElementById('zoomInfo');
        
        if (img) {
            img.style.transform = 'translate(0, 0) scale(1)';
        }
        
        if (zoomInfo) {
            zoomInfo.textContent = '100%';
        }
    }

    toggleFullscreen() {
        const previewModal = document.getElementById('previewModal');
        previewModal.classList.toggle('fullscreen');
        
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const icon = fullscreenBtn.querySelector('i');
        
        if (previewModal.classList.contains('fullscreen')) {
            icon.className = 'fas fa-compress';
            fullscreenBtn.title = 'Exit Fullscreen';
        } else {
            icon.className = 'fas fa-expand';
            fullscreenBtn.title = 'Fullscreen';
        }
    }

    downloadFromPreview() {
        if (this.currentPreviewFile) {
            this.downloadFile(this.currentPreviewFile.fileId, this.currentPreviewFile.filename);
        }
    }

    // Update preview file info with actual size from server
    async updatePreviewFileInfo(fileId, filename) {
        try {
            const response = await fetch(`/api/files`);
            if (response.ok) {
                const files = await response.json();
                const file = files.find(f => f.fileId === fileId);
                if (file) {
                    const previewFileInfo = document.getElementById('previewFileInfo');
                    previewFileInfo.textContent = `${filename} • ${this.formatFileSize(file.size)}`;
                }
            }
        } catch (error) {
            console.warn('Could not update file info:', error);
        }
    }

    getFileIcon(filename) {
        if (!filename || typeof filename !== 'string') {
            return 'fas fa-file default'; // Default icon with CSS class
        }
        
        const extension = filename.split('.').pop().toLowerCase();
        
        // PDF files
        if (extension === 'pdf') {
            return 'fas fa-file-pdf pdf';
        }
        
        // Image files
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff'].includes(extension)) {
            return 'fas fa-file-image image';
        }
        
        // Video files
        if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp'].includes(extension)) {
            return 'fas fa-file-video video';
        }
        
        // Audio files
        if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(extension)) {
            return 'fas fa-file-audio audio';
        }
        
        // Document files
        if (['doc', 'docx'].includes(extension)) {
            return 'fas fa-file-word document';
        }
        
        // Excel files
        if (['xls', 'xlsx', 'csv'].includes(extension)) {
            return 'fas fa-file-excel excel';
        }
        
        // PowerPoint files
        if (['ppt', 'pptx'].includes(extension)) {
            return 'fas fa-file-powerpoint powerpoint';
        }
        
        // Archive files
        if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
            return 'fas fa-file-archive archive';
        }
        
        // Code files
        if (['js', 'ts', 'jsx', 'tsx', 'html', 'htm', 'css', 'scss', 'sass', 'less', 
             'php', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'rb', 'go', 'rs', 'swift',
             'kt', 'scala', 'clj', 'hs', 'elm', 'ml', 'r', 'sql', 'json', 'xml', 
             'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf'].includes(extension)) {
            return 'fas fa-file-code code';
        }
        
        // Text files
        if (['txt', 'md', 'markdown', 'rtf', 'log'].includes(extension)) {
            return 'fas fa-file-alt text';
        }
        
        // CAD files
        if (['dwg', 'dxf', 'dwf', 'step', 'stp', 'iges', 'igs'].includes(extension)) {
            return 'fas fa-drafting-compass cad';
        }
        
        // 3D Model files
        if (['obj', 'fbx', 'dae', 'blend', 'max', 'maya', 'c4d', 'skp'].includes(extension)) {
            return 'fas fa-cube model';
        }
        
        // Font files
        if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(extension)) {
            return 'fas fa-font font';
        }
        
        // Executable files
        if (['exe', 'msi', 'dmg', 'pkg', 'deb', 'rpm', 'appimage'].includes(extension)) {
            return 'fas fa-cog executable';
        }
        
        // Default icon
        return 'fas fa-file default';
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

    // Theme toggle functionality
    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        body.classList.toggle('dark-theme');
        
        if (body.classList.contains('dark-theme')) {
            icon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'dark');
        } else {
            icon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'light');
        }
    }

    // Initialize theme from localStorage
    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const body = document.body;
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        if (savedTheme === 'dark') {
            body.classList.add('dark-theme');
            icon.className = 'fas fa-sun';
        } else {
            body.classList.remove('dark-theme');
            icon.className = 'fas fa-moon';
        }
    }

    // View switching functionality
    switchView(viewType) {
        const filesGrid = document.getElementById('filesGrid');
        const gridBtn = document.getElementById('gridViewBtn');
        const listBtn = document.getElementById('listViewBtn');
        
        if (viewType === 'list') {
            filesGrid.classList.add('list-view');
            filesGrid.classList.remove('grid-view');
            gridBtn.classList.remove('active');
            listBtn.classList.add('active');
            localStorage.setItem('viewType', 'list');
        } else {
            filesGrid.classList.add('grid-view');
            filesGrid.classList.remove('list-view');
            listBtn.classList.remove('active');
            gridBtn.classList.add('active');
            localStorage.setItem('viewType', 'grid');
        }
    }

    // Initialize view from localStorage
    initView() {
        const savedView = localStorage.getItem('viewType') || 'grid';
        this.switchView(savedView);
    }

    // ==================== ADVANCED SEARCH & FILTERING METHODS ====================
    
    applyFilters(files, searchTerm = '') {
        const fileTypeFilter = document.getElementById('fileTypeFilter').value;
        const sizeFilter = document.getElementById('sizeFilter').value;
        
        return files.filter(file => {
            if (!file || typeof file !== 'object') return false;
            
            // Get file properties with Arabic support
            const filename = file.originalName || file.filename || file.name || '';
            const description = file.description || '';
            const fileSize = file.size || file.file_size || 0;
            let tags = file.tags || [];
            
            // Handle tags (might be JSON string or array)
            if (typeof tags === 'string') {
                try {
                    tags = JSON.parse(tags);
                } catch (e) {
                    tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                }
            }
            if (!Array.isArray(tags)) tags = [];
            
            // Search filter (supports Arabic and English)
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = 
                    filename.toLowerCase().includes(searchLower) ||
                    description.toLowerCase().includes(searchLower) ||
                    tags.some(tag => tag.toLowerCase().includes(searchLower));
                
                if (!matchesSearch) return false;
            }
            
            // File type filter
            if (fileTypeFilter) {
                const fileType = this.getFileCategory(filename);
                if (fileType !== fileTypeFilter) return false;
            }
            
            // Size filter
            if (sizeFilter) {
                const sizeInMB = fileSize / (1024 * 1024);
                switch (sizeFilter) {
                    case 'small':
                        if (sizeInMB >= 1) return false;
                        break;
                    case 'medium':
                        if (sizeInMB < 1 || sizeInMB > 10) return false;
                        break;
                    case 'large':
                        if (sizeInMB < 10 || sizeInMB > 100) return false;
                        break;
                    case 'xlarge':
                        if (sizeInMB <= 100) return false;
                        break;
                }
            }
            
            return true;
        });
    }

    applySorting(files) {
        const sortBy = document.getElementById('sortBy').value;
        
        return files.sort((a, b) => {
            const aName = a.originalName || a.filename || a.name || '';
            const bName = b.originalName || b.filename || b.name || '';
            const aSize = a.size || a.file_size || 0;
            const bSize = b.size || b.file_size || 0;
            const aDate = new Date(a.uploadedAt || a.uploaded_at || a.created_at || 0);
            const bDate = new Date(b.uploadedAt || b.uploaded_at || b.created_at || 0);
            
            switch (sortBy) {
                case 'name-asc':
                    return aName.localeCompare(bName, ['ar', 'en'], { numeric: true });
                case 'name-desc':
                    return bName.localeCompare(aName, ['ar', 'en'], { numeric: true });
                case 'size-asc':
                    return aSize - bSize;
                case 'size-desc':
                    return bSize - aSize;
                case 'date-asc':
                    return aDate - bDate;
                case 'date-desc':
                    return bDate - aDate;
                case 'type-asc':
                    const aType = this.getFileCategory(aName);
                    const bType = this.getFileCategory(bName);
                    return aType.localeCompare(bType);
                default:
                    return bDate - aDate; // Default to newest first
            }
        });
    }

    getFileCategory(filename) {
        if (!filename) return 'other';
        const extension = filename.split('.').pop().toLowerCase();
        
        if (extension === 'pdf') return 'pdf';
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) return 'image';
        if (['dwg', 'dxf'].includes(extension)) return 'cad';
        if (['xls', 'xlsx'].includes(extension)) return 'excel';
        if (['doc', 'docx', 'txt'].includes(extension)) return 'document';
        if (['zip', 'rar', '7z'].includes(extension)) return 'archive';
        return 'other';
    }

    updateFileStats(filteredFiles, totalFiles) {
        // Show stats section if there are files
        const statsSection = document.getElementById('statsSection');
        if (totalFiles > 0 && statsSection) {
            statsSection.style.display = 'block';
        }

        // Update basic stats
        const totalFilesElement = document.getElementById('totalFiles');
        const totalSizeElement = document.getElementById('totalSize');
        const recentUploadsElement = document.getElementById('recentUploads');
        const mostCommonTypeElement = document.getElementById('mostCommonType');
        
        if (totalFilesElement) {
            totalFilesElement.textContent = totalFiles;
        }
        
        if (totalSizeElement) {
            const totalSize = filteredFiles.reduce((sum, file) => {
                return sum + (file.size || file.file_size || 0);
            }, 0);
            totalSizeElement.textContent = this.formatFileSize(totalSize);
        }

        // Calculate recent uploads (last 7 days)
        if (recentUploadsElement) {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const recentCount = filteredFiles.filter(file => {
                const uploadDate = new Date(file.uploadedAt || file.uploaded_at || file.created_at);
                return uploadDate >= oneWeekAgo;
            }).length;
            
            recentUploadsElement.textContent = recentCount;
        }

        // Find most common file type
        if (mostCommonTypeElement && filteredFiles.length > 0) {
            const typeCounts = {};
            filteredFiles.forEach(file => {
                const filename = file.originalName || file.filename || file.name || '';
                const type = this.getFileCategory(filename).toUpperCase();
                typeCounts[type] = (typeCounts[type] || 0) + 1;
            });
            
            let mostCommonType = 'PDF';
            let maxCount = 0;
            for (const [type, count] of Object.entries(typeCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    mostCommonType = type;
                }
            }
            
            mostCommonTypeElement.textContent = mostCommonType;
        }
    }

    hasActiveFilters() {
        const searchInput = document.getElementById('searchInput');
        const fileTypeFilter = document.getElementById('fileTypeFilter');
        const sizeFilter = document.getElementById('sizeFilter');
        
        return (searchInput && searchInput.value.trim()) ||
               (fileTypeFilter && fileTypeFilter.value) ||
               (sizeFilter && sizeFilter.value);
    }

    // Filter and search event handlers
    handleSearch(e) {
        const searchTerm = e.target.value.trim();
        const clearBtn = document.getElementById('clearSearchBtn');
        
        // Show/hide clear button
        if (searchTerm) {
            clearBtn.style.display = 'block';
        } else {
            clearBtn.style.display = 'none';
        }
        
        // Debounce search for better performance
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.applyFiltersAndRender();
        }, 300);
    }

    handleFilter() {
        this.applyFiltersAndRender();
        this.updateActiveFilterTags();
    }

    handleSort() {
        this.applyFiltersAndRender();
    }

    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearSearchBtn');
        
        searchInput.value = '';
        clearBtn.style.display = 'none';
        this.applyFiltersAndRender();
    }

    clearAllFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('fileTypeFilter').value = '';
        document.getElementById('sizeFilter').value = '';
        document.getElementById('sortBy').value = 'date-desc';
        document.getElementById('clearSearchBtn').style.display = 'none';
        
        this.applyFiltersAndRender();
        this.updateActiveFilterTags();
    }

    toggleFilters() {
        const filtersContainer = document.querySelector('.filters-container');
        const filterBtn = document.getElementById('filterToggleBtn');
        const icon = filterBtn.querySelector('i');
        
        filtersContainer.classList.toggle('hidden');
        
        if (filtersContainer.classList.contains('hidden')) {
            icon.className = 'fas fa-filter';
            filterBtn.title = 'Show Filters';
        } else {
            icon.className = 'fas fa-filter-circle-xmark';
            filterBtn.title = 'Hide Filters';
        }
    }

    updateActiveFilterTags() {
        const filterTagsContainer = document.getElementById('filterTags');
        const tags = [];
        
        const fileTypeFilter = document.getElementById('fileTypeFilter').value;
        const sizeFilter = document.getElementById('sizeFilter').value;
        const searchInput = document.getElementById('searchInput').value.trim();
        
        if (searchInput) {
            tags.push({ type: 'search', label: `Search: "${searchInput}"`, value: 'search' });
        }
        
        if (fileTypeFilter) {
            const typeLabels = {
                'pdf': 'PDF Files',
                'image': 'Images', 
                'cad': 'CAD Files',
                'excel': 'Excel Files',
                'document': 'Documents',
                'archive': 'Archives'
            };
            tags.push({ type: 'type', label: `Type: ${typeLabels[fileTypeFilter]}`, value: 'fileType' });
        }
        
        if (sizeFilter) {
            const sizeLabels = {
                'small': '< 1 MB',
                'medium': '1-10 MB',
                'large': '10-100 MB',
                'xlarge': '> 100 MB'
            };
            tags.push({ type: 'size', label: `Size: ${sizeLabels[sizeFilter]}`, value: 'size' });
        }
        
        if (tags.length > 0) {
            filterTagsContainer.innerHTML = tags.map(tag => 
                `<span class="filter-tag" data-filter="${tag.value}">
                    ${tag.label}
                    <button onclick="fileManager.removeFilter('${tag.value}')" title="Remove filter">
                        <i class="fas fa-times"></i>
                    </button>
                </span>`
            ).join('');
            filterTagsContainer.style.display = 'flex';
        } else {
            filterTagsContainer.style.display = 'none';
        }
    }

    removeFilter(filterType) {
        switch (filterType) {
            case 'search':
                this.clearSearch();
                break;
            case 'fileType':
                document.getElementById('fileTypeFilter').value = '';
                break;
            case 'size':
                document.getElementById('sizeFilter').value = '';
                break;
        }
        this.handleFilter();
    }

    applyFiltersAndRender() {
        // Get current files from the last loaded data
        if (this.currentFiles) {
            const searchTerm = document.getElementById('searchInput').value.trim();
            this.renderFiles(this.currentFiles, searchTerm);
        } else {
            this.loadFiles(); // Reload if no current data
        }
    }

    // Fix corrupted Arabic filenames (from Latin-1 to UTF-8)
    fixArabicFilename(filename) {
        if (!filename || typeof filename !== 'string') return filename;
        
        // Check if this looks like corrupted Arabic (Latin-1 encoded)
        if (filename.includes('Ø') || filename.includes('Ù') || filename.includes('Ú') || filename.includes('Û')) {
            try {
                // Convert from Latin-1 to UTF-8
                const encoder = new TextEncoder();
                const decoder = new TextDecoder('utf-8');
                
                // First encode as Latin-1 bytes
                const latin1Bytes = new Uint8Array(filename.length);
                for (let i = 0; i < filename.length; i++) {
                    latin1Bytes[i] = filename.charCodeAt(i) & 0xFF;
                }
                
                // Then decode as UTF-8
                const fixedName = decoder.decode(latin1Bytes);
                
                // Basic validation - check if it contains Arabic characters
                if (/[\u0600-\u06FF\u0750-\u077F]/.test(fixedName)) {
                    return fixedName;
                }
            } catch (error) {
                console.warn('Failed to fix Arabic filename:', error);
            }
        }
        
        return filename;
    }

    // Show toast message to user
    showMessage(message, type = 'info') {
        // Remove any existing toast
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.textContent = message;

        // Add to page
        document.body.appendChild(toast);

        // Show with animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Help modal methods
    showHelpModal() {
        const helpModal = document.getElementById('helpModal');
        helpModal.style.display = 'block';
        
        // Add click-outside-to-close functionality
        setTimeout(() => {
            const closeOnOutsideClick = (e) => {
                if (e.target === helpModal) {
                    this.closeHelpModal();
                    helpModal.removeEventListener('click', closeOnOutsideClick);
                }
            };
            helpModal.addEventListener('click', closeOnOutsideClick);
        }, 100);
    }

    closeHelpModal() {
        document.getElementById('helpModal').style.display = 'none';
    }
}

// Initialize the file manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.fileManager = new FileManager();
});

// Make fileManager globally accessible for onclick handlers
window.fileManager = null;
