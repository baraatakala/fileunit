# 🏗️ FileUnit - Construction File Sharing Platform

[![Platform Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com/baraatakala/fileunit)
[![Node Version](https://img.shields.io/badge/Node.js-v14+-blue)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com/)
[![Deployments](https://img.shields.io/badge/Deployments-32-brightgreen)](https://github.com/baraatakala/fileunit/deployments)

A modern, professional file-sharing platform designed specifically for construction companies and professionals. Upload, manage, and share large technical files including AutoCAD drawings (.dwg), PDFs, and construction documents with **automatic version control** and **Supabase cloud storage**.

## 🌟 What's New

- ✅ **Supabase Integration** - Cloud storage with PostgreSQL database
- ✅ **Dark/Light Theme Toggle** - Enhanced user experience
- ✅ **Enhanced Version Control** - Advanced file versioning system
- ✅ **Improved Security** - Content Security Policy and rate limiting
- ✅ **Mobile Responsive** - Optimized for all devices
- ✅ **Real-time File Status** - Live upload progress and storage monitoring

## 🎯 Key Features

### 📁 Advanced File Management
- **Large File Support**: Upload files up to **500MB** (AutoCAD .dwg, PDF, images, etc.)
- **Multiple File Types**: PDF, DWG, DXF, JPG, PNG, ZIP, DOC, DOCX, TXT
- **Drag & Drop Interface**: Modern, intuitive file upload experience
- **Batch Upload**: Upload multiple files simultaneously
- **File Preview**: Quick preview for supported file types

### 🔄 Intelligent Version Control
- **Automatic Version Tracking**: Smart version detection when same filename uploaded
- **Version History**: Complete history with timestamps and descriptions
- **Version Comparison**: Easy access to all file revisions
- **Rollback Capability**: Restore any previous version instantly
- **Version Metadata**: Track descriptions and tags across versions

### 🔍 Smart Organization & Search
- **Real-time Search**: Instant search by filename, description, or tags
- **Advanced Tagging**: Organize with custom tags (blueprints, structural, electrical)
- **Rich Descriptions**: Add detailed context to uploads
- **Smart Sorting**: Multiple sorting options (date, size, name, type)
- **Grid/List Views**: Switch between viewing modes

### 🛡️ Enterprise-Grade Security
- **Supabase Cloud Storage**: Secure, scalable cloud infrastructure
- **Content Security Policy**: Protection against XSS and injection attacks
- **Rate Limiting**: DDoS protection (100 requests per 15 minutes)
- **File Validation**: Comprehensive type and size checking
- **UUID-based Naming**: Secure file identification system
- **Environment Protection**: Secure configuration management

### 🎨 Modern User Experience
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Progressive Web App**: Install as desktop application
- **Real-time Feedback**: Live progress indicators and status updates
- **Accessibility**: WCAG compliant interface

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Supabase Account** (free tier available) - [Sign up](https://supabase.com/)
- **Git** (optional, for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/baraatakala/fileunit.git
   cd fileunit
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   # or
   npm install
   ```

3. **Configure Supabase** (Choose one method)
   
   **Option A: Quick Setup Script (Windows)**
   ```powershell
   .\deploy-supabase.ps1
   ```
   
   **Option B: Manual Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your Supabase details
   # Get these from your Supabase dashboard
   ```

4. **Start the platform**
   
   **Option A: Simple Start (Windows)**
   ```powershell
   .\start-local-simple.ps1
   ```
   
   **Option B: Standard Start**
   ```bash
   npm start
   ```
   
   **Option C: Development Mode**
   ```bash
   npm run dev
   ```

5. **Access your platform**
   ```
   🌐 Open browser: http://localhost:3000
   ```

## 📖 Usage Guide

### 🔄 First-Time Setup
1. **Create Supabase Project**: Visit [Supabase Dashboard](https://app.supabase.com/)
2. **Get Credentials**: Copy your Project URL and API Key
3. **Update Environment**: Add credentials to `.env` file
4. **Initialize Database**: Run setup script or use provided SQL scripts

### 📤 Uploading Files
1. **Drag & Drop**: Simply drag files into the upload zone
2. **Browse Files**: Click "Browse Files" to select manually
3. **Add Metadata**: 
   - Description (optional, up to 500 characters)
   - Tags (optional, comma-separated)
4. **Upload**: Click "Upload Files" button
5. **Monitor Progress**: Watch real-time upload progress

### 🗂️ Managing Files
- **📥 Download**: Click green download button
- **📋 View Versions**: Click "Versions" to see complete history
- **🗑️ Delete**: Remove files (with confirmation dialog)
- **🔍 Search**: Use search bar for instant file finding
- **👁️ Preview**: Quick preview for supported formats
- **🏷️ Filter by Tags**: Click tags to filter files

### 🎨 Customization
- **🌙 Theme Toggle**: Switch between dark and light themes
- **📊 View Options**: Toggle between grid and list views
- **📈 Statistics**: Monitor storage usage and file counts

## 🏗️ Perfect for Construction Industry

### Supported Construction Files
- **📐 CAD Files**: `.dwg`, `.dxf` (AutoCAD drawings, up to 500MB)
- **📋 Documentation**: PDF plans, specifications, contracts
- **📷 Site Media**: Progress photos, inspection images
- **📄 Reports**: Word documents, text files
- **📦 Archives**: ZIP files with multiple documents
- **📊 Spreadsheets**: Project data, calculations

### Industry-Specific Features
- **Large File Handling**: Optimized for CAD files and high-res images
- **Version Control**: Critical for drawing revisions and updates
- **Team Collaboration**: Shared access with description and tagging
- **Mobile Access**: Site managers can access files on tablets/phones
- **Secure Sharing**: Professional-grade security for sensitive documents

## 🔧 Technical Architecture

### Backend Stack
- **🟢 Node.js**: High-performance JavaScript runtime
- **⚡ Express.js**: Fast, minimalist web framework
- **🔒 Helmet.js**: Security middleware
- **📦 Multer**: File upload handling
- **🗄️ Supabase**: PostgreSQL database + storage
- **🛡️ CORS**: Cross-origin request handling
- **⏱️ Rate Limiting**: Built-in DDoS protection

### Frontend Stack
- **🌐 HTML5**: Semantic, accessible markup
- **🎨 CSS3**: Modern styling with Grid and Flexbox
- **⚡ Vanilla JavaScript**: No framework dependencies
- **📱 Responsive Design**: Mobile-first approach
- **🎭 Font Awesome 6**: Professional icon library
- **🌙 Theme System**: Dynamic dark/light mode switching

### Cloud Infrastructure
- **☁️ Supabase**: 
  - PostgreSQL database
  - File storage buckets
  - Real-time subscriptions
  - Built-in authentication ready
- **🚀 Multiple Deployment Options**:
  - Render.com
  - Railway
  - Heroku
  - VPS/Custom hosting

## 📁 Project Structure

```
fileunit/
├── 📂 backend/
│   ├── 🟢 server.js              # Main server file
│   ├── 🟢 server-local.js        # Local development server
│   ├── 📦 package.json           # Backend dependencies
│   └── ⚙️ .env                   # Environment variables
├── 📂 frontend/
│   ├── 🌐 index.html            # Main application
│   ├── 🎨 style.css             # Responsive styling
│   └── ⚡ script.js             # Application logic
├── 📂 config/
│   ├── 🔧 supabase-config.js    # Database configuration
│   └── ⚙️ environment setup     # Various config files
├── 📂 database/
│   ├── 🗃️ schema.sql            # Database schema
│   └── 📊 migrations/           # Database migrations
├── 📂 deployment/
│   ├── 🚀 render.yaml           # Render deployment
│   ├── 🐳 Procfile              # Heroku deployment
│   └── 📜 Various deploy scripts
└── 📋 README.md                 # This documentation
```

## ⚙️ Configuration

### Environment Variables
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# File Upload Limits
MAX_FILE_SIZE=524288000  # 500MB
ALLOWED_EXTENSIONS=pdf,dwg,dxf,jpg,jpeg,png,zip,doc,docx,txt

# Security
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900000  # 15 minutes
```

### File Size & Type Limits
```javascript
// Customize in backend/server.js
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = [
  'application/pdf',        // PDF
  'image/vnd.dwg',         // AutoCAD DWG
  'image/vnd.dxf',         // AutoCAD DXF
  'image/jpeg',            // JPEG images
  'image/png',             // PNG images
  'application/zip',       // ZIP archives
  // ... more types
];
```

## 🚀 Deployment Options

### Option 1: Deploy to Render (Recommended)
```bash
# Connect your GitHub repo to Render
# Set environment variables in Render dashboard
# Deploy automatically on push
```

### Option 2: Deploy to Railway
```bash
# Connect GitHub repository
# Set environment variables
# Deploy with zero configuration
```

### Option 3: Deploy to Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_ANON_KEY=your-key
git push heroku main
```

### Option 4: VPS/Custom Server
```bash
# Upload files to server
# Install Node.js and dependencies
# Use PM2 for process management
# Configure nginx reverse proxy
# Set up SSL certificates
```

## 🛡️ Security & Production Considerations

### Security Checklist
- ✅ **Environment Variables**: All secrets in `.env` files
- ✅ **Rate Limiting**: 100 requests per 15 minutes per IP
- ✅ **File Validation**: Type, size, and content checking
- ✅ **CSP Headers**: Prevents XSS attacks
- ✅ **CORS Configuration**: Controlled cross-origin access
- ✅ **Supabase RLS**: Row-level security policies
- 🔄 **Authentication**: Ready for implementation
- 🔄 **Authorization**: Role-based access control ready

### Production Hardening
```javascript
// Additional security for production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));
```

## 📊 Monitoring & Analytics

### Health Monitoring
```bash
# Check application health
curl http://localhost:3000/api/health

# Monitor file upload endpoint
curl http://localhost:3000/api/files

# Check Supabase connection
curl http://localhost:3000/api/test-connection
```

### Key Metrics to Track
- 📈 **Upload Success Rate**: Monitor failed uploads
- 📊 **Storage Usage**: Track Supabase storage consumption
- ⚡ **Response Times**: API endpoint performance
- 👥 **User Activity**: File views and downloads
- 🚨 **Error Rates**: Track and resolve issues

## 🆘 Troubleshooting

### Common Issues & Solutions

#### ❌ Supabase Connection Error
```bash
# Check your environment variables
cat .env | grep SUPABASE

# Test connection
node -e "console.log(process.env.SUPABASE_URL)"

# Verify Supabase project is active
# Check Supabase dashboard for service status
```

#### ❌ File Upload Fails
```bash
# Check file size (max 500MB)
# Verify file type is supported
# Check Supabase storage bucket policies
# Review server logs: npm run dev

# Check storage quota in Supabase dashboard
# Verify bucket permissions
```

#### ❌ Files Don't Display
```bash
# Check browser console for errors (F12)
# Verify Supabase configuration
# Check file permissions in bucket
# Review network tab for API failures
```

#### ❌ Port Already in Use
```powershell
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Or use different port
$env:PORT=3001; npm start
```

### Getting Expert Help
1. 📖 **Check Documentation**: Review setup guides in `/docs`
2. 🔍 **Review Logs**: Enable debug mode with `DEBUG=*`
3. 🌐 **Supabase Dashboard**: Monitor database and storage
4. 🐛 **Browser DevTools**: Check console and network tabs
5. 📧 **Create Issue**: Use GitHub Issues for bug reports

## 🔮 Roadmap & Future Enhancements

### Version 2.0 (In Development)
- 🔐 **User Authentication**: Full user management system
- 👥 **Team Collaboration**: Project-based file organization
- 💬 **File Comments**: Collaborative annotations
- 🔔 **Real-time Notifications**: File updates and shares
- 📱 **Mobile App**: Native iOS/Android applications

### Version 2.1 (Planned)
- 🔗 **File Sharing Links**: Secure, expiring share URLs
- 🔍 **Advanced Search**: Full-text search and filters
- 📊 **Analytics Dashboard**: Usage statistics and insights
- 🔌 **API Integration**: Connect with construction management tools
- 🎯 **Project Templates**: Pre-configured project structures

### Version 3.0 (Future Vision)
- 🤖 **AI-Powered Features**: Smart file categorization
- 🔄 **Sync Capabilities**: Desktop app synchronization
- 🌍 **Multi-language Support**: Internationalization
- 📐 **CAD File Preview**: In-browser DWG/DXF viewing
- ☁️ **Multi-cloud Support**: AWS S3, Google Cloud integration

## 🤝 Contributing

We welcome contributions from the construction and development communities!

### How to Contribute
1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. ✍️ **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. 📤 **Push** to the branch (`git push origin feature/amazing-feature`)
5. 🔀 **Open** a Pull Request

### Development Setup
```bash
# Clone your fork
git clone https://github.com/your-username/fileunit.git
cd fileunit

# Install dependencies
npm install

# Set up development environment
cp .env.example .env
# Edit .env with your development Supabase credentials

# Start development server
npm run dev
```

### Contribution Guidelines
- ✅ Follow existing code style and patterns
- ✅ Add tests for new features
- ✅ Update documentation for changes
- ✅ Test on multiple browsers and devices
- ✅ Ensure mobile responsiveness

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ **Commercial Use**: Use in commercial projects
- ✅ **Modification**: Modify and distribute
- ✅ **Distribution**: Share with others
- ✅ **Private Use**: Use in private projects
- ❗ **Liability**: No warranty provided
- ❗ **Attribution**: Must include license notice

## 🏆 Acknowledgments

- 🎨 **Font Awesome**: Beautiful, consistent icons
- ☁️ **Supabase**: Powerful backend-as-a-service
- 🟢 **Node.js Community**: Excellent ecosystem
- 🏗️ **Construction Industry**: For inspiring this solution
- 👥 **Contributors**: Everyone who helped build this platform

## 📞 Support & Contact

### Get Help
- 📚 **Documentation**: Comprehensive guides in repository
- 🐛 **Bug Reports**: [Create an Issue](https://github.com/baraatakala/fileunit/issues)
- 💡 **Feature Requests**: [Discussion Board](https://github.com/baraatakala/fileunit/discussions)
- ⭐ **Star the Project**: Show your support!

### Professional Services
Looking for custom development, enterprise deployment, or consulting services? Contact the development team for professional support.

---

<div align="center">

**Built with ❤️ for Construction Professionals 🏗️**

*FileUnit is designed specifically for the construction industry's unique needs for sharing large technical files with reliable version control and cloud storage.*

[![GitHub stars](https://img.shields.io/github/stars/baraatakala/fileunit?style=social)](https://github.com/baraatakala/fileunit/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/baraatakala/fileunit?style=social)](https://github.com/baraatakala/fileunit/network)

[⭐ Star this project](https://github.com/baraatakala/fileunit) • [🐛 Report Bug](https://github.com/baraatakala/fileunit/issues) • [💡 Request Feature](https://github.com/baraatakala/fileunit/discussions)

</div>
