const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ MongoDB connection established successfully.');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Unable to connect to MongoDB:', error);
    throw error;
  }
};

module.exports = { mongoose, connectMongoDB };
