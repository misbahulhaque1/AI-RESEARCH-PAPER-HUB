/**
 * Automatic Database Setup Script for Windows
 * Checks if required databases are installed and provides installation guidance
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('🔧 RESEARCH PLATFORM - DATABASE SETUP CHECKER');
console.log('='.repeat(60) + '\n');

let allGood = true;

// Check MySQL
function checkMySQL() {
  console.log('📊 Checking MySQL...');
  try {
    execSync('mysql --version', { stdio: 'ignore' });
    console.log('   ✅ MySQL is installed\n');
    return true;
  } catch (error) {
    console.log('   ❌ MySQL is NOT installed\n');
    console.log('   📥 Installation commands:');
    console.log('      Option 1 (winget): winget install Oracle.MySQL');
    console.log('      Option 2 (manual): https://dev.mysql.com/downloads/installer/\n');
    console.log('   After installation, run:');
    console.log('      mysql -u root -e "CREATE DATABASE research_papers;"\n');
    allGood = false;
    return false;
  }
}

// Check MongoDB
function checkMongoDB() {
  console.log('📊 Checking MongoDB...');
  try {
    execSync('mongod --version', { stdio: 'ignore' });
    console.log('   ✅ MongoDB is installed\n');
    return true;
  } catch (error) {
    console.log('   ❌ MongoDB is NOT installed\n');
    console.log('   📥 Installation commands:');
    console.log('      Option 1 (winget): winget install MongoDB.Server');
    console.log('      Option 2 (choco): choco install mongodb');
    console.log('      Option 3 (manual): https://www.mongodb.com/try/download/community\n');
    allGood = false;
    return false;
  }
}

// Check Redis
function checkRedis() {
  console.log('📊 Checking Redis...');
  try {
    // For Windows, check if redis-server is available
    execSync('redis-server --version', { stdio: 'ignore' });
    console.log('   ✅ Redis is installed\n');
    return true;
  } catch (error) {
    console.log('   ❌ Redis is NOT installed\n');
    console.log('   📥 Installation options for Windows:');
    console.log('      Option 1: Use WSL (Windows Subsystem for Linux)');
    console.log('         wsl --install');
    console.log('         Then inside WSL: sudo apt-get install redis-server');
    console.log('      Option 2: Use Memurai (Redis for Windows)');
    console.log('         https://www.memurai.com/get-memurai');
    console.log('      Option 3: Use Docker (if available)');
    console.log('         docker run -d -p 6379:6379 redis:7-alpine\n');
    allGood = false;
    return false;
  }
}

// Check Elasticsearch
function checkElasticsearch() {
  console.log('📊 Checking Elasticsearch...');
  try {
    execSync('elasticsearch --version', { stdio: 'ignore' });
    console.log('   ✅ Elasticsearch is installed\n');
    return true;
  } catch (error) {
    console.log('   ❌ Elasticsearch is NOT installed\n');
    console.log('   📥 Installation options:');
    console.log('      Option 1 (manual): https://www.elastic.co/downloads/elasticsearch');
    console.log('      Option 2: The platform can work WITHOUT Elasticsearch');
    console.log('         Search will use MySQL instead (slower but functional)\n');
    // Elasticsearch is optional, don't set allGood = false
    return false;
  }
}

// Create database if it exists
function createDatabase() {
  console.log('\n🗄️  Creating database...');
  try {
    execSync('mysql -u root -e "CREATE DATABASE IF NOT EXISTS research_papers;"', { stdio: 'pipe' });
    console.log('   ✅ Database "research_papers" created or already exists\n');
    return true;
  } catch (error) {
    console.log('   ⚠️  Could not create database. Please run manually:');
    console.log('      mysql -u root -e "CREATE DATABASE research_papers;"\n');
    return false;
  }
}

// Run all checks
checkMySQL();
checkMongoDB();
checkRedis();
checkElasticsearch();

if (allGood) {
  createDatabase();
  
  console.log('='.repeat(60));
  console.log('✅ ALL DATABASES ARE READY!');
  console.log('='.repeat(60));
  console.log('\n📝 Next steps:');
  console.log('   1. npm install (install dependencies)');
  console.log('   2. npm run dev (start development server)');
  console.log('\n🌐 Your platform will be available at:');
  console.log('   Frontend: http://localhost:5173');
  console.log('   Backend: http://localhost:5000\n');
} else {
  console.log('='.repeat(60));
  console.log('⚠️  SOME DATABASES ARE MISSING');
  console.log('='.repeat(60));
  console.log('\n📝 Please install the missing databases using the commands above.');
  console.log('\n💡 TIP: You can still test the platform with just MySQL + MongoDB.');
  console.log('   Redis and Elasticsearch are optional (for caching and advanced search).\n');
}

console.log('='.repeat(60) + '\n');
