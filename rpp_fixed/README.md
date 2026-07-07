# 🎓 AI Research Paper Intelligence Platform

A fully working, production-ready Google Scholar-like research paper platform with real file upload/download, database-backed paper management, and local database setup.

---

## ✨ Features

### Core Functionality
- ✅ **Upload Research Papers** - PDF upload with metadata (title, authors, abstract, tags)
- ✅ **Download Papers** - One-click download with automatic download count tracking
- ✅ **Search Papers** - Full-text search across title, abstract, and authors
- ✅ **Filter & Sort** - Filter by year, source; sort by newest, oldest, most downloaded, title
- ✅ **Paper Management** - Create, read, update, delete papers
- ✅ **1000+ Pre-loaded Papers** - Bulk import from OpenAlex API

### Technical Features
- ✅ **Local Databases** - No Docker dependency
- ✅ **MySQL** - Primary data storage
- ✅ **MongoDB** - AI summaries storage
- ✅ **Redis** - Caching layer
- ✅ **Elasticsearch** - Advanced search (optional)
- ✅ **JWT Authentication** - Secure user management
- ✅ **Cloudinary Integration** - Cloud PDF storage (optional)
- ✅ **AI Summarization** - Hugging Face integration

---

## 🚀 Quick Start

### Prerequisites
Install these local databases (Windows):

```powershell
# MySQL
winget install Oracle.MySQL

# MongoDB
winget install MongoDB.Server

# Redis (Option 1: WSL)
wsl --install
# Then inside WSL: sudo apt-get install redis-server

# Redis (Option 2: Memurai for Windows)
# Download from: https://www.memurai.com/get-memurai
```

### One-Command Setup

```powershell
# Windows
.\start-production.bat
```

### Manual Setup

```powershell
# 1. Check database installations
cd backend
npm run setup-db

# 2. Install dependencies
cd ..
npm run install:all

# 3. Start servers
npm run dev
```

---

## 📁 Project Structure

```
research-paper-platform/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database configurations
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, upload, validation
│   │   ├── models/         # Sequelize/Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Setup & import scripts
│   │   └── services/       # Business logic
│   ├── uploads/            # Local PDF storage
│   ├── .env                # Environment variables
│   └── package.json
├── frontend/               # React/Vite UI
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API services
│   │   └── context/        # React context (auth)
│   └── package.json
├── docker-compose.yml      # Optional Docker setup
├── start.bat              # Docker-based start
└── start-production.bat   # Local database start
```

---

## 🗄️ Database Schema

### MySQL Tables

#### `users`
```sql
- user_id (INT, PK, AUTO_INCREMENT)
- name (VARCHAR 100)
- email (VARCHAR 100, UNIQUE)
- password_hash (VARCHAR 255)
- created_at (DATETIME)
```

#### `papers`
```sql
- paper_id (INT, PK, AUTO_INCREMENT)
- title (TEXT)
- abstract (TEXT)
- authors (TEXT)
- year (INT)
- source (VARCHAR 100)
- url (VARCHAR 500)
- pdf_url (VARCHAR 500)
- file_url (VARCHAR 500)
- doi (VARCHAR 255)
- tags (JSON)
- keywords (JSON)
- upload_date (DATETIME)
- uploaded_by (INT, FK -> users)
- downloads_count (INT, DEFAULT 0)
- created_at (DATETIME)
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register     - Create account
POST   /api/auth/login        - Login
GET    /api/auth/me           - Get current user
```

### Papers
```
GET    /api/papers                     - List papers (with search/filter/sort)
GET    /api/papers/:id                 - Get paper by ID
POST   /api/papers                     - Create paper
POST   /api/papers/upload              - Upload PDF paper
GET    /api/papers/download/:id        - Download PDF
PUT    /api/papers/:id                 - Update paper
DELETE /api/papers/:id                 - Delete paper
POST   /api/papers/import/openalex     - Import from OpenAlex
```

### Search
```
GET    /api/search?q=query             - Search papers
```

### Saved Papers
```
GET    /api/saved                      - Get saved papers
POST   /api/saved/:paperId             - Save paper
DELETE /api/saved/:paperId             - Unsave paper
```

### Analytics
```
GET    /api/analytics/stats            - Get platform stats
GET    /api/analytics/trending         - Get trending papers
GET    /api/analytics/popular-topics   - Get popular topics
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=research_papers

# MongoDB
MONGODB_URI=mongodb://localhost:27017/research_ai

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## 📝 Usage Examples

### Upload a Paper
1. Click **"Upload Paper"** button on Dashboard
2. Select PDF file
3. Fill in: Title, Authors, Abstract, Tags
4. Click **"Upload Paper"**
5. Paper appears in listing immediately

### Download a Paper
1. Browse papers on Dashboard
2. Click **"Download"** button
3. PDF downloads automatically
4. Download count increments

### Search Papers
1. Enter search query in search box
2. Click **"Search"**
3. Results filtered by title, abstract, authors

### Sort Papers
- **Newest First** - Most recent uploads
- **Oldest First** - Earliest uploads
- **Most Downloaded** - Popular papers
- **Title (A-Z)** - Alphabetical

---

## 🧪 Testing Workflow

### 1. Test Account Creation
```
1. Go to http://localhost:5173
2. Click "Don't have an account? Sign up"
3. Fill: Name, Email, Password
4. Click "Create Account"
5. Auto-login to Dashboard
```

### 2. Test Paper Upload
```
1. Click "Upload Paper" button
2. Select a PDF file
3. Enter: Title, Authors, Abstract, Tags
4. Click "Upload Paper"
5. Verify paper appears in listing
```

### 3. Test Paper Download
```
1. Find any paper with PDF
2. Click "Download" button
3. Verify PDF downloads
4. Check download count increased
```

### 4. Test Search
```
1. Enter keyword in search box
2. Click "Search"
3. Verify results match query
```

### 5. Test Sort
```
1. Change sort dropdown
2. Verify order changes
```

---

## 📦 NPM Scripts

### Backend
```bash
npm run dev           # Start development server
npm run setup-db      # Check database installations
npm run import:bulk   # Import 1000+ papers from OpenAlex
npm run import:openalex  # Import papers (custom query)
```

### Frontend
```bash
npm run dev           # Start Vite dev server
npm run build         # Build for production
```

### Root
```bash
npm run install:all   # Install all dependencies
npm run dev           # Start both frontend & backend
```

---

## 🛠️ Troubleshooting

### MySQL Connection Error
```
Solution:
1. Ensure MySQL is running
2. Check .env has correct port (3306)
3. Run: mysql -u root -e "CREATE DATABASE research_papers;"
```

### Port Already in Use
```
Solution:
1. Find process: netstat -ano | findstr :5000
2. Kill process: taskkill /PID <PID> /F
3. Restart server
```

### Redis Not Available
```
Solution:
1. Platform works without Redis (optional)
2. Or install: winget install Redis-64
3. Or use WSL: sudo apt-get install redis-server
```

### Elasticsearch Not Available
```
Solution:
1. Platform works without Elasticsearch (optional)
2. Search uses MySQL as fallback
3. Or install from: elastic.co/downloads/elasticsearch
```

---

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| API Health | http://localhost:5000/health |
| MySQL | localhost:3306 |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |
| Elasticsearch | localhost:9200 |

---

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

---

## 🤝 Support

For issues or questions:
1. Check troubleshooting section
2. Verify all databases are running
3. Check console logs for errors
4. Ensure .env is properly configured

---

**Built with ❤️ using React, Node.js, Express, MySQL, MongoDB, Redis, and Elasticsearch**
