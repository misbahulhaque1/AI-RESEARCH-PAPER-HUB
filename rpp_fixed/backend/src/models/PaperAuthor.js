const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql');
const Paper = require('./Paper');
const Author = require('./Author');

const PaperAuthor = sequelize.define('PaperAuthor', {
  paper_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Paper,
      key: 'paper_id'
    }
  },
  author_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Author,
      key: 'author_id'
    }
  }
}, {
  tableName: 'paper_authors',
  timestamps: false
});

// Define relationships
Paper.belongsToMany(Author, { through: PaperAuthor, foreignKey: 'paper_id' });
Author.belongsToMany(Paper, { through: PaperAuthor, foreignKey: 'author_id' });

module.exports = PaperAuthor;
