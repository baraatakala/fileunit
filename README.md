# 🏗️ Construction File Sharing Platform

A professional file-sharing platform designed specifically for construction companies. Upload, manage, and share large files like AutoCAD drawings (.dwg), PDFs, and other construction documents with automatic version control.

![Platform Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Node Version](https://img.shields.io/badge/Node.js-v14+-blue)
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

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v14 or higher)
- Git (optional, for development)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/baraatakala/file-tracking.git
   cd file-tracking
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Start the server**
   
   **Option A: Using PowerShell Script (Windows)**
   ```powershell
   .\start-local-simple.ps1
   ```
   
   **Option B: Using npm**
   ```bash
   npm start
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

## 🔧 **Technical Specifications**

### **Backend (Node.js)**
- **Framework**: Express.js
- **File Upload**: Multer middleware
- **Security**: Helmet.js, CORS, Rate limiting
- **Storage**: Local filesystem
- **Database**: In-memory (upgradeable)

### **Frontend**
- **Technologies**: HTML5, CSS3, Vanilla JavaScript
- **UI Framework**: Custom responsive design
- **Icons**: Font Awesome 6
- **File Handling**: Advanced drag-drop interface

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License.

---

**Built with ❤️ for the construction industry**

```javascript
// Firebase Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null || true; // For now, allow all writes
    }
  }
}
```

#### Firestore Rules:
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development - tighten in production
    }
  }
}
```

### 3. Environment Configuration

```bash
# Copy environment template
cd backend
cp .env.template .env

# Edit .env with your Firebase details
# Replace 'your-project-id' with your actual Firebase project ID
```

Update the `.env` file:
```env
PORT=3000
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_PROJECT_ID=your-project-id
NODE_ENV=development
```

### 4. Start the Application

```bash
# From the backend directory
npm start

# Or for development with auto-reload
npm run dev
```

The application will be available at: `http://localhost:3000`

## 📖 Usage

### Uploading Files

1. **Drag & Drop**: Drag files directly onto the upload zone
2. **Browse**: Click "Browse Files" to select files
3. **Add Details**: Optionally add description and tags
4. **Upload**: Click "Upload Files"

### Managing Files

- **Download**: Click the download button on any file
- **View Versions**: Click "Versions" to see all versions of a file
- **Delete**: Remove files you no longer need
- **Search**: Use the search bar to find specific files

### Supported File Types

- **CAD Files**: .dwg, .dxf
- **Documents**: .pdf, .doc, .docx, .txt
- **Images**: .jpg, .jpeg, .png
- **Archives**: .zip
- **Maximum Size**: 500MB per file

## 🏗️ Project Structure

```
file-sharing-platform/
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── index.html        # Main HTML file
│   ├── style.css         # Styling
│   └── script.js         # Frontend JavaScript
├── config/
│   └── firebase-service-account.json  # Firebase credentials
└── README.md             # This file
```

## 🔧 Configuration

### File Size Limits
Edit `MAX_FILE_SIZE` in `.env` (in bytes):
```env
MAX_FILE_SIZE=524288000  # 500MB
```

### Allowed File Types
Edit `ALLOWED_EXTENSIONS` in `.env`:
```env
ALLOWED_EXTENSIONS=pdf,dwg,dxf,jpg,jpeg,png,zip,doc,docx,txt
```

### Port Configuration
```env
PORT=3000  # Change to your preferred port
```

## 🛡️ Security Considerations

### For Production:

1. **Authentication**: Add user authentication
2. **Authorization**: Implement role-based access
3. **File Validation**: Add virus scanning
4. **Rate Limiting**: Already included, adjust as needed
5. **HTTPS**: Use SSL certificates
6. **Environment Variables**: Use secure environment management

### Firebase Security Rules:
Update Firebase rules for production:

```javascript
// Production Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true; // Adjust based on your needs
      allow write: if request.auth != null; // Require authentication
    }
  }
}
```

## 🚀 Deployment

### Option 1: Deploy to Heroku

1. Install Heroku CLI
2. Create Heroku app
3. Set environment variables
4. Deploy:

```bash
# From project root
git init
git add .
git commit -m "Initial commit"
heroku create your-app-name
git push heroku main
```

### Option 2: Deploy to Railway

1. Connect your GitHub repository to Railway
2. Set environment variables
3. Deploy automatically

### Option 3: Deploy to VPS

1. Upload project to your server
2. Install Node.js and dependencies
3. Use PM2 for process management
4. Configure nginx as reverse proxy

## 📊 Monitoring

Check application health:
- Health endpoint: `GET /api/health`
- Monitor Firebase usage in Firebase Console
- Check server logs for errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues:

#### Firebase Connection Error
- Verify your `firebase-service-account.json` is correctly placed
- Check that Firebase Storage and Firestore are enabled
- Ensure your project ID matches in all configuration files

#### Upload Fails
- Check file size (max 500MB)
- Verify file type is supported
- Check Firebase Storage quotas
- Review server logs for detailed errors

#### Files Don't Load
- Check Firestore rules allow read access
- Verify Firebase project configuration
- Check browser console for JavaScript errors

#### Port Already in Use
```bash
# Find and kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Or use a different port
PORT=3001 npm start
```

### Getting Help

- Check Firebase Console for quota and error information
- Review browser developer tools console
- Check server logs for detailed error messages
- Ensure all environment variables are correctly set

## 🔮 Future Enhancements

- User authentication and authorization
- File sharing with expiration dates
- Collaborative comments on files
- Project-based file organization
- Integration with construction management tools
- Mobile app development
- Advanced search and filtering
- File preview capabilities

---

**Built for Construction Professionals** 🏗️

This platform is designed specifically for the construction industry's unique needs for sharing large technical files with reliable version control.
