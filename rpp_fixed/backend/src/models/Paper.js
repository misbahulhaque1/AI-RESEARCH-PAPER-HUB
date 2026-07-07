const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql');

const Paper = sequelize.define('Paper', {
  paper_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  abstract: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  authors: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  pdf_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  doi: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  cloudinary_public_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  keywords: {
    type: DataTypes.JSON,
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  upload_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  downloads_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'papers',
  timestamps: false
});

module.exports = Paper;
