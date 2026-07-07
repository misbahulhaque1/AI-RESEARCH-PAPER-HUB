const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql');

const Author = sequelize.define('Author', {
  author_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'authors',
  timestamps: false
});

module.exports = Author;
