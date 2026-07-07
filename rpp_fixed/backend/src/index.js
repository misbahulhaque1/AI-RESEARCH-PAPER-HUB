require('express-async-errors');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Load all Sequelize models together so their association definitions
// (Paper<->Author, User/Paper<->SavedPaper, etc.) actually get registered.
// Controllers require individual model files directly, which used to skip
// this file entirely - meaning associations were NEVER set up, causing
// "X is not associated to Y" errors on saved papers, summaries, analytics.
require('./models');

// Import database configurations
const { connectMySQL } = require('./config/mysql');
const { connectMongoDB } = require('./config/mongodb');
const { connectElasticsearch, createPaperIndex } = require('./config/elasticsearch');

// Import routes
const authRoutes = require('./routes/auth');
const paperRoutes = require('./routes/papers');
const searchRoutes = require('./routes/search');
const savedRoutes = require('./routes/saved');
const summaryRoutes = require('./routes/summaries');
const analyticsRoutes = require('./routes/analytics');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Static files
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint - verify backend is working
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Research Paper Platform API', 
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      papers: '/api/papers',
      search: '/api/search',
      saved: '/api/saved',
      analytics: '/api/analytics'
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working' });
});

// Simple login endpoint (mock - for testing)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication - accept any email/password
  if (email && password) {
    const mockUser = {
      user_id: 1,
      name: email.split('@')[0],
      email: email,
      role: 'user'
    };
    
    // Mock JWT token (in production, use real JWT)
    const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: mockUser,
        token: mockToken
      }
    });
  }
  
  return res.status(401).json({
    success: false,
    message: 'Email and password are required'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/papers', summaryRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize databases and start server
const startServer = async () => {
  try {
    // Connect to databases (graceful fallback)
    try {
      await connectMySQL();
      // Sync MySQL models (creates tables if they don't exist)
      const { sequelize } = require('./config/mysql');
      await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
      console.log('✅ MySQL models synchronized');
    } catch (mysqlError) {
      console.warn('⚠️  MySQL connection failed - continuing without it:', mysqlError.message);
      console.warn('💡 User authentication and paper metadata will use MongoDB');
    }

    try {
      await connectMongoDB();
    } catch (mongoError) {
      console.warn('⚠️  MongoDB connection failed:', mongoError.message);
    }

    try {
      await connectElasticsearch();
      // Create Elasticsearch index
      await createPaperIndex();
    } catch (esError) {
      console.warn('⚠️  Elasticsearch connection failed:', esError.message);
      console.warn('💡 Search will use MySQL LIKE queries');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check at http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
