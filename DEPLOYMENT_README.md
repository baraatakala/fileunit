# 🏗️ Construction File Sharing Platform

A professional file-sharing platform designed specifically for construction companies. Upload, manage, and share large files like AutoCAD drawings (.dwg), PDFs, and other construction documents with automatic version control.

![Platform Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Node Version](https://img.shields.io/badge/Node.js-v16+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 **Features**

### 📁 **File Management**
- **Large File Support**: Upload files up to 500MB (AutoCAD .dwg, PDF, images, etc.)
- **Multiple File Types**: PDF, DWG, DXF, JPG, PNG, ZIP, DOC, DOCX, TXT
- **Drag & Drop Interface**: Modern, intuitive file upload
- **Batch Upload**: Upload multiple files simultaneously

### 🔄 **Version Control**
- **Automatic Version Tracking**: Keep track of file versions when updated
- **Version History**: View and download any previous version
- **Latest Version Highlighting**: Clear indication of current version
- **Version Comparison**: Easy access to all file revisions

### 🔍 **Organization & Search**
- **Smart Search**: Real-time search by filename, description, or tags
- **Tag System**: Organize files with custom tags (blueprints, structural, electrical)
- **File Descriptions**: Add context and details to uploads
- **Date Sorting**: Files organized by upload date

### 🛡️ **Security & Performance**
- **Content Security Policy**: Protection against XSS attacks
- **Rate Limiting**: DDoS protection (100 requests per 15 minutes)
- **File Validation**: Type and size checking
- **Secure Storage**: UUID-based file naming for security

### 🌐 **User Experience**
- **Responsive Design**: Works on desktop and mobile devices
- **Arabic Language Support**: Perfect for Middle Eastern construction companies
- **Professional UI**: Construction-themed interface with purple branding
- **Browser Compatibility**: Works in Chrome, Firefox, Edge, Safari

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v16 or higher)
- Git (optional, for development)
- Modern web browser

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/baraatakala/file-tracking.git
   cd file-tracking
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the server**
   
   **Option A: Using PowerShell Script (Windows)**
   ```powershell
   .\start-local-simple.ps1
   ```
   
   **Option B: Manual Start**
   ```bash
   cd backend
   node server-local.js
   ```

4. **Access the platform**
   ```
   Open browser: http://localhost:3000
   ```

## 📋 **Usage Guide**

### **Uploading Files**
1. **Drag & Drop**: Simply drag files into the upload zone
2. **Browse**: Click "Browse Files" to select files
3. **Add Details**: Optionally add description and tags
4. **Upload**: Click the green "Upload Files" button

### **Managing Files**
- **Download**: Click the green download button
- **View Versions**: Click orange "Versions" button to see all versions
- **Delete**: Click red delete button (with confirmation)
- **Search**: Use the search box to find files quickly

### **Version Control**
- Upload same filename → Automatic new version created
- All previous versions preserved and accessible
- Download any version individually

## 🏗️ **Perfect For Construction Industry**

### **Supported Construction Files**
- **📐 AutoCAD Drawings**: .dwg, .dxf files (up to 500MB)
- **📋 Plans & Specs**: PDF documents, specifications
- **📷 Site Photos**: Progress photos, inspections
- **📄 Documentation**: Contracts, reports, correspondence
- **📦 Archives**: Compressed project files

### **Use Cases**
- **Project Managers**: Share plans and track revisions
- **Architects**: Manage drawing versions and updates
- **Contractors**: Access latest blueprints and documents
- **Teams**: Collaborate with centralized file access

## 🔧 **Technical Specifications**

### **Backend (Node.js)**
- **Framework**: Express.js
- **File Upload**: Multer middleware
- **Security**: Helmet.js, CORS, Rate limiting
- **Storage**: Local filesystem (easily configurable for cloud)
- **Database**: In-memory (upgradeable to MongoDB/PostgreSQL)

### **Frontend**
- **Technologies**: HTML5, CSS3, Vanilla JavaScript
- **UI Framework**: Custom responsive design
- **Icons**: Font Awesome 6
- **File Handling**: Advanced drag-drop with progress tracking

### **File Storage**
- **Current**: Local filesystem (`backend/uploads/`)
- **Scalable**: Architecture supports cloud storage migration
- **Organized**: UUID-based naming with metadata tracking

## 📁 **Project Structure**

```
file-tracking/
├── backend/                 # Server-side application
│   ├── server-local.js     # Main server file (local storage)
│   ├── server.js           # Server file (Firebase version)
│   ├── package.json        # Dependencies and scripts
│   ├── uploads/            # File storage directory
│   └── .env               # Environment variables
├── frontend/               # Client-side application
│   ├── index.html         # Main HTML file
│   ├── script.js          # JavaScript functionality
│   └── style.css          # Styling and responsive design
├── config/                # Configuration files
├── start-local-simple.ps1 # Windows PowerShell startup script
└── README.md              # This file
```

## 🌟 **Advanced Features**

### **Version Control System**
- **Automatic Detection**: Same filename = new version
- **Version History**: Complete revision tracking
- **Easy Rollback**: Download any previous version
- **Latest Flagging**: Clear identification of current version

### **Professional UI**
- **Construction Theme**: Hard hat icons and industry branding
- **Purple Gradient**: Modern, professional color scheme
- **Responsive Layout**: Perfect on all device sizes
- **Intuitive UX**: Familiar drag-drop interface

### **Security Features**
- **CSP Protection**: Comprehensive Content Security Policy
- **Rate Limiting**: Protection against abuse
- **File Validation**: Type and size restrictions
- **Secure Naming**: UUID-based file identification

## 🔄 **Development & Deployment**

### **Local Development**
```bash
# Install dependencies
cd backend && npm install

# Start development server
npm run dev  # Uses nodemon for auto-restart

# Access application
# http://localhost:3000
```

### **Production Deployment**
```bash
# Install production dependencies
cd backend && npm install --production

# Start production server
npm start

# Or use PM2 for process management
pm2 start server-local.js --name "file-sharing"
```

### **Environment Variables**
```env
PORT=3000                    # Server port
NODE_ENV=production         # Environment mode
MAX_FILE_SIZE=524288000     # Max file size (500MB)
```

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### **Common Issues**
- **Port 3000 in use**: Kill existing Node processes or use different port
- **File upload fails**: Check file size (max 500MB) and type restrictions
- **Server won't start**: Ensure Node.js is installed and in PATH

### **Getting Help**
- 📧 Email: [Your Email]
- 🐛 Issues: [GitHub Issues](https://github.com/baraatakala/file-tracking/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/baraatakala/file-tracking/discussions)

## 🏆 **Success Stories**

This platform is actively used for:
- ✅ **Attendance Management**: Daily reports and analytics
- ✅ **Project Documentation**: Construction file management
- ✅ **Team Collaboration**: Centralized file sharing
- ✅ **Version Control**: Drawing revision management

## 🔮 **Roadmap**

### **Upcoming Features**
- [ ] User authentication and permissions
- [ ] Cloud storage integration (AWS S3, Google Cloud)
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] API documentation with Swagger
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

---

**Built with ❤️ for the construction industry**

*Professional file sharing made simple, secure, and scalable.*
