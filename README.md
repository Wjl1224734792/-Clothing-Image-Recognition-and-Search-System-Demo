# 👗 Fashion Image Recognition & Search System (Local Deployment Demo)

An intelligent fashion image recognition and search system based on MVC/MVP architecture, using Milvus vector database and Marqo/marqo-fashionSigLIP AI model for fashion image feature extraction and similarity search.

## ✨ Features

- 👗 **Fashion Recognition**: AI-powered recognition and feature extraction specifically for fashion images
- 🔍 **Intelligent Search**: Fashion image similarity search based on Marqo/marqo-fashionSigLIP model
- 📁 **Batch Upload**: Support for multiple fashion images upload and vectorization storage
- 🎨 **Multiple Search Methods**: Support for file upload, URL, Blob and other fashion image search methods
- ⚡ **High Performance**: Using Milvus vector database, supporting large-scale fashion image search
- 🔒 **Secure & Reliable**: File type validation, path security checks
- 🏗️ **Clear Architecture**: Frontend-backend separation, MVC/MVP architecture design
- 🧠 **AI-Driven**: Using Marqo/marqo-fashionSigLIP model for fashion feature extraction
- 📱 **Responsive Design**: Adapts to different device screen sizes
- 🆔 **UUID File Naming**: Frontend generates UUID, backend uses UUID as filename to avoid conflicts
- 🔗 **Correlation Management**: Support for correlation_id management with delete, update, and query operations
- 🎯 **Professional Optimization**: 768-dimensional feature vectors optimized for fashion images

## 🏗️ Technical Architecture

### Frontend Architecture (MVP)
- **Vue 3** - Modern frontend framework using Composition API
- **Vite** - Fast build tool
- **Axios** - HTTP client
- **MVP Pattern** - Model-View-Presenter architecture

### Backend Architecture (MVC)
- **Express.js** - Node.js web framework
- **Multer** - File upload handling
- **@huggingface/transformers** - AI model inference
- **MVC Pattern** - Model-View-Controller architecture

### Database & Storage
- **Milvus** - Vector database supporting large-scale vector search
- **Local Storage** - Local image file storage

### AI Model
- **Marqo/marqo-fashionSigLIP** - Feature extraction model specifically for fashion images
- **768-Dimensional Vectors** - Fixed 768-dimensional fashion feature representation
- **Automatic Feature Extraction** - Automatic fashion image preprocessing and feature extraction
- **Fashion Recognition Optimization** - Optimized for fashion items, accessories, and style recognition

## 📁 Project Structure

```
Fashion Image Recognition & Search System/
├── frontend/                    # Vue 3 Frontend Project (MVP Architecture)
│   ├── src/
│   │   ├── components/         # Vue Components
│   │   ├── models/             # Data Models
│   │   ├── services/           # Service Layer
│   │   ├── presenters/         # Presenters
│   │   ├── App.vue             # Main Application Component
│   │   └── main.js             # Application Entry Point
│   ├── package.json            # Frontend Dependencies
│   └── vite.config.js          # Vite Configuration
├── backend/                     # Express Backend Project (MVC Architecture)
│   ├── src/
│   │   ├── controllers/        # Controller Layer
│   │   ├── services/           # Service Layer
│   │   ├── repositories/        # Data Access Layer
│   │   ├── models/             # Data Models
│   │   ├── middlewares/        # Middleware
│   │   ├── routers/            # Routes
│   │   ├── utils/              # Utilities
│   │   └── enums/              # Enums
│   ├── uploads/                # Image Storage Directory
│   ├── config.js               # Configuration File
│   ├── server.js               # Server Entry Point
│   └── package.json            # Backend Dependencies
├── uploads/                     # Image Storage (Shared)
├── docker-compose.yml           # Milvus Deployment Configuration
└── README.md                    # Project Documentation
```

## 🚀 Quick Start

### 1. Environment Setup

Ensure the following software is installed:
- Node.js (v16+)
- Docker & Docker Compose
- Git

### 2. Start Milvus Service

```bash
# Start Milvus vector database
docker-compose up -d

# Verify service status
docker-compose ps
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Start Application

```bash
# Start backend service (port 3001)
cd backend
npm run dev

# Start frontend service (port 5173)
cd frontend
npm run dev
```

### 5. Access Application

- **Frontend Interface**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **Image Access**: http://localhost:3001/uploads/

## 📖 Usage Guide

### Fashion Image Upload Feature
1. Select "Image Upload" tab
2. Click or drag to select multiple fashion image files
3. Click "Start Upload" button to upload fashion images
4. System automatically calculates fashion image feature vectors and stores them in Milvus

### Fashion Image Search Feature
1. Select "Image Search" tab
2. Support three search methods:
   - **Upload Image**: Select fashion image file for search
   - **Image URL**: Enter fashion image URL for search
   - **Select Image to Blob**: Select fashion image file and automatically convert to Blob format for search
3. Click "Start Search" button for fashion similarity search
4. View search results, displayed in similarity order with matching fashion images

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Milvus Configuration
MILVUS_HOST=localhost
MILVUS_PORT=19530
MILVUS_SSL=false
MILVUS_ADMIN_USER=root
MILVUS_ADMIN_PASSWORD=Milvus

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp
MAX_FILES=10

# Model Configuration
MODEL_CACHE_DIR=./.cache
MODEL_NAME=Marqo/marqo-fashionSigLIP
```

## 🛠️ Development Guide

### Architecture Overview

#### Backend MVC Architecture
- **Controller**: Handle HTTP requests and responses
- **Service**: Business logic processing
- **Repository**: Data access layer, interact with Milvus
- **Model**: Data model definitions

#### Frontend MVP Architecture
- **Model**: Data models and state management
- **View**: Vue components, user interface
- **Presenter**: Business logic processing, connecting Model and View
- **Service**: API communication services

### Adding New Features

#### Backend Development
1. Create controller methods in `controllers/`
2. Implement business logic in `services/`
3. Add data access in `repositories/`
4. Register routes in `routers/`

#### Frontend Development
1. Create Vue components in `components/`
2. Implement business logic in `presenters/`
3. Add API calls in `services/`
4. Define data structures in `models/`

### Custom Search Parameters

```javascript
// Modify search parameters
const searchParams = {
  metric_type: 'L2',
  params: { nprobe: 10 },
  limit: 20
};
```

## 📊 Performance Optimization

- **Fashion Image Compression**: Automatic fashion image size adjustment
- **Caching Mechanism**: Local caching of Marqo/marqo-fashionSigLIP model files
- **Batch Processing**: Support for batch fashion image upload
- **Vector Indexing**: Using HNSW index to improve fashion search speed
- **Collection Preloading**: Preload collections into memory
- **Temporary File Cleanup**: Automatic cleanup of temporary files during search
- **Vector Normalization**: L2 normalization to improve fashion search accuracy

## 🔒 Security Features

- **File Type Validation**: Only allow image formats
- **File Size Limits**: Prevent large file attacks
- **Path Security Checks**: Prevent directory traversal attacks
- **Secure File Names**: Prevent filename conflicts

## 📝 Changelog

### v2.1.0 (2025-10-18)
- 🎯 **Frontend Architecture Optimization**:
  - Fixed image upload progress bar display issues, using real progress tracking instead of simulated progress
  - Refactored `ApiService` to use `XMLHttpRequest` for real-time progress callbacks
  - Optimized `ImagePresenter` progress management logic with delayed reset mechanism
  - Cleaned up unused code: removed `ImageView` interface and `views` directory
  - Simplified project structure, improved code maintainability
- 🧹 **Code Cleanup**: Removed redundant code, optimized project structure
- 📈 **User Experience Enhancement**: Real progress feedback, smoother upload experience
- 📚 **Documentation Unification**: Removed separate frontend/backend README docs, unified to root README.md
- 📖 **Documentation Completion**: Integrated API interfaces, component descriptions, configuration guides
- 🔧 **API Interface Optimization**: Added Blob format support, providing more flexible image processing
- 🎨 **Frontend Blob Support**: Changed Base64 search to Blob search, improved performance and compatibility

### v2.0.0 (2025-10-17)
- 🏗️ **Architecture Refactoring**: Adopted MVC/MVP architecture design
- 🎨 **Frontend Refactoring**: Vue 3 + MVP architecture
- 🔧 **Backend Refactoring**: Express + MVC architecture
- 📱 **Responsive Design**: Adapts to different device screens
- 👗 **Fashion Recognition Optimization**: AI recognition and search specifically for fashion images
- 🔍 **Multiple Search Methods**: Support for file upload, URL, Base64 search
- ⚡ **Performance Optimization**: Optimized startup logs, improved user experience
- 🗑️ **Feature Streamlining**: Removed image list functionality, focused on core search features
- 🔗 **Correlation Management**: Added correlation_id management functionality with delete, update, query operations
- 📚 **Documentation Enhancement**: Updated API documentation, added quick start guide

### v1.0.0 (2025-10-10)
- ✨ Initial version release
- 👗 Complete fashion image recognition and search functionality
- 🚀 Frontend-backend separation architecture
- 🔧 Milvus vector database integration

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 📡 API Documentation

### Basic Information
- **Service URL**: `http://localhost:3001`
- **Health Check**: `http://localhost:3001/api/health`

### Core Interfaces

#### 1. Image Upload Insert
```http
POST /api/images/upload
Content-Type: multipart/form-data

# Parameters
images: File[] (image file array)
uuids: string[] (UUID array for file naming)
correlation_id: string (optional, correlation ID)
```

#### 2. String Method Insert
```http
POST /api/images/insert
Content-Type: application/json

{
  "image_path": "path/to/image.jpg",
  "image_data": "data:image/jpeg;base64,...",
  "image_url": "https://example.com/image.jpg",
  "correlation_id": "user_001"
}
```

#### 3. Blob Method Insert
```http
POST /api/images/insert/blob
Content-Type: application/json

{
  "image_blob": "data:image/jpeg;base64,...",
  "image_url": "https://example.com/image.jpg",
  "correlation_id": "user_001"
}
```

#### 4. File Upload Search
```http
POST /api/images/search/upload
Content-Type: multipart/form-data

# Parameters
image: File (search image file)
limit: number (optional, default 20)
```

#### 5. String Method Search
```http
POST /api/images/search
Content-Type: application/json

{
  "image_path": "path/to/image.jpg",
  "image_data": "data:image/jpeg;base64,...",
  "image_url": "https://example.com/image.jpg",
  "limit": 20
}
```

#### 6. Blob Method Search
```http
POST /api/images/search/blob
Content-Type: application/json

{
  "image_blob": "data:image/jpeg;base64,...",
  "image_url": "https://example.com/image.jpg",
  "limit": 20
}
```

#### 7. Operations by correlation_id
```http
# Delete
DELETE /api/images/correlation/:correlationId

# Query
GET /api/images/correlation/:correlationId
```

#### 8. Update Embedding Data Interface
```http
# File upload method to update embedding data
POST /api/images/correlation/:correlationId/update/upload
Content-Type: multipart/form-data

# Parameters
images: File[] (image file array)
correlation_id: string (correlation ID from URL path)

# String method to update embedding data
POST /api/images/correlation/:correlationId/update/string
Content-Type: application/json

{
  "image_path": "path/to/image.jpg",
  "image_data": "data:image/jpeg;base64,...",
  "image_url": "https://example.com/image.jpg"
}

# Blob method to update embedding data
POST /api/images/correlation/:correlationId/update/blob
Content-Type: application/json

{
  "image_blob": "data:image/jpeg;base64,...",
  "image_url": "https://example.com/image.jpg"
}
```

#### 9. Local Batch Import (by file paths)
```http
POST /api/images/batch-insert
Content-Type: application/json

{
  "image_paths": [
    "D:/dataset/fashion/001.jpg",
    "./imageDataColection/img/top/002.png"
  ],
  "correlation_id": "batch_20251020",
  "batch_name": "autumn_collection"
}
```

- Notes:
  - `image_paths` supports absolute/relative paths; relative paths are resolved against the backend working directory.
  - The backend generates a 768-d vector for each image and writes to Milvus; `file_path` is stored as an absolute path.
  - The response array includes each record's processing result (`status`, `filePath`, `vectorId`, `correlation_id`).

## 🗄️ Database Schema

### Milvus Collection Structure
```javascript
{
  image_id: Int64 (Primary key, auto-increment),
  file_path: VarChar(500) (File path),
  correlation_id: VarChar(100) (Correlation ID),
  image_embedding: FloatVector(768) (Image feature vector)
}
```

### Index Configuration
- **Index Type**: HNSW
- **Distance Metric**: L2
- **Parameters**: M=16, efConstruction=200

## 🎨 Frontend Component Documentation

### ImageUpload.vue
Image upload component providing file selection and upload functionality.

**Props:**
- `uploading`: Boolean - Whether currently uploading
- `uploadProgress`: Number - Upload progress (0-100)

**Events:**
- `upload`: Upload event, passes file list
- `error`: Error event, passes error information

### ImageSearch.vue
Image search component providing multiple search methods.

**Props:**
- `searching`: Boolean - Whether currently searching

**Events:**
- `search-upload`: File upload search event
- `search-url`: URL search event
- `search-blob`: Blob search event
- `error`: Error event

### SearchResults.vue
Search results display component showing similar images found.

**Props:**
- `results`: Array - Search results array
- `loading`: Boolean - Whether currently loading

**Events:**
- `clear`: Clear search results event

## 🔧 Configuration Details

### File Upload Limits
- **Single File Size**: Maximum 10MB
- **Total File Size**: Maximum 50MB
- **Supported Formats**: jpg, jpeg, png, gif, webp
- **Maximum Files**: 10

### API Configuration
- **Base URL**: `http://localhost:3001`
- **Timeout Settings**: 30 seconds
- **Retry Mechanism**: Automatic retry for failed requests

## 📱 Responsive Design

### Breakpoint Settings
```css
/* Mobile devices */
@media (max-width: 480px) { ... }

/* Tablet devices */
@media (max-width: 768px) { ... }

/* Desktop devices */
@media (min-width: 769px) { ... }
```

### Layout Features
- **Flexible Layout**: Using Flexbox and Grid
- **Adaptive Images**: Automatic image scaling
- **Touch Friendly**: Mobile device touch optimization

## 🎨 Style System

### Design Principles
- **Modern Minimalism**: Clean visual design
- **Consistency**: Unified colors and fonts
- **Accessibility**: Good contrast and readability

### Color Scheme
```css
:root {
  --primary-color: #3b82f6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --text-color: #374151;
  --bg-color: #f9fafb;
}
```

### Animation Effects
- **Transition Animations**: Smooth state transitions
- **Loading Animations**: Elegant loading indicators
- **Hover Effects**: Interactive feedback animations

## 🚨 Error Handling

### Error Code Definitions
```javascript
const NErrorCode = {
  Success: 0,
  InvalidParam: 1001,
  NotFound: 1002,
  InternalError: 1003,
  Unauthorized: 1004,
  Forbidden: 1005
};
```

### Unified Response Format
```javascript
// Success response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error response
{
  "success": false,
  "error": "Error message",
  "code": 1001
}
```

## 🔍 Debugging and Monitoring

### Health Checks
```http
GET /api/health
GET /api/health/collection
```

### Log Levels
- **INFO**: Normal operation logs
- **ERROR**: Error information
- **DEBUG**: Detailed debug information (development environment)

## 📦 Build and Deployment

### Development Build
```bash
# Frontend development
cd frontend
npm run dev

# Backend development
cd backend
npm run dev
```

### Production Build
```bash
# Frontend build
cd frontend
npm run build

# Backend start
cd backend
npm start
```

### Build Output
- **Static Files**: `frontend/dist/` directory
- **Resource Optimization**: Automatic compression and optimization
- **Code Splitting**: On-demand loading

## 🧪 Testing

### Unit Testing
```bash
# Frontend testing
cd frontend
npm run test

# Backend testing
cd backend
npm run test
```

### End-to-End Testing
```bash
# Frontend E2E testing
cd frontend
npm run test:e2e
```

## 🚀 Deployment Guide

### Docker Deployment
```bash
# Build images
docker build -t fashion-search-backend ./backend
docker build -t fashion-search-frontend ./frontend

# Run containers
docker-compose up -d
```

### Production Environment Configuration
```bash
# Set environment variables
export NODE_ENV=production
export PORT=3001
export MILVUS_HOST=your-milvus-host
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Milvus Connection Failed
```bash
# Check Milvus service status
docker-compose ps

# View Milvus logs
docker-compose logs milvus
```

#### 2. Model Loading Failed
```bash
# Clear model cache
rm -rf ./.cache

# Re-download model
npm run dev
```

#### 3. File Upload Failed
- Check file size limits
- Confirm supported file formats
- Verify upload directory permissions

### Performance Tuning

#### Backend Optimization
```javascript
// Adjust search parameters
const searchParams = {
  metric_type: 'L2',
  params: { nprobe: 20 }, // Increase search precision
  limit: 50 // Increase number of returned results
};
```

#### Frontend Optimization
```javascript
// Enable image lazy loading
const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src]');
  // Implement lazy loading logic
};
```

## 📊 Monitoring and Logging

### Application Monitoring
- **Health Check**: `/api/health`
- **Collection Status**: `/api/health/collection`
- **System Information**: `/api/health/system`

### Log Management
```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log
```

## 🔐 Security Best Practices

### Production Environment Security
1. **Environment Variable Protection**: Use `.env` files to manage sensitive information
2. **HTTPS Configuration**: Enable SSL/TLS encryption
3. **Access Control**: Configure firewall and access restrictions
4. **Regular Updates**: Keep dependency packages up to date

### Data Security
- Encrypted storage of image files
- Vector data access control
- Regular backup of important data

## 📚 Related Documentation

- [API Documentation](./backend/API-文档.md) - Complete API interface documentation
- [Environment Configuration Guide](./backend/环境配置说明.md) - Detailed environment configuration guide
- [Backend Development Standards](./backend/服务端开发规范.md) - Backend development standards
- [Frontend MVP Architecture Guide](./frontend/MVP-架构说明.md) - Frontend architecture guide

## 🤝 Community Support

### Getting Help
- 📧 **Email Support**: support@fashion-search.com
- 💬 **Technical Discussion Group**: Scan QR code to join
- 📖 **Documentation Center**: https://docs.fashion-search.com

### Contributing Code
1. Check [Contributing Guide](#contributing)
2. Submit Issue describing the problem
3. Create Pull Request
4. Participate in code review

## 🙏 Acknowledgments

Thanks to the following open source projects and technical communities for their support:

- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Express.js](https://expressjs.com/) - Node.js web framework
- [Milvus](https://milvus.io/) - Vector database
- [@huggingface/transformers](https://huggingface.co/docs/transformers) - AI model inference library
- [Marqo](https://marqo.ai/) - Vector search platform
- [Vite](https://vitejs.dev/) - Fast build tool
- [Docker](https://www.docker.com/) - Containerization platform

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

---

**⭐ If this project is helpful to you, please give us a Star!**
