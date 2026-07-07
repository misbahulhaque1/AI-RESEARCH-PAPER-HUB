const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/mysql');
const User = require('./User');
const Paper = require('./Paper');

const SavedPaper = sequelize.define('SavedPaper', {
  save_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  paper_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Paper,
      key: 'paper_id'
    }
  },
  saved_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'saved_papers',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'paper_id']
    }
  ]
});

// Define relationships
User.belongsToMany(Paper, { through: SavedPaper, foreignKey: 'user_id' });
Paper.belongsToMany(User, { through: SavedPaper, foreignKey: 'paper_id' });

// Direct associations - needed because controllers query SavedPaper
// directly with `include: [{ model: Paper }]` / `{ model: User }`,
// which requires belongsTo/hasMany, not just the belongsToMany above.
SavedPaper.belongsTo(Paper, { foreignKey: 'paper_id' });
SavedPaper.belongsTo(User, { foreignKey: 'user_id' });
Paper.hasMany(SavedPaper, { foreignKey: 'paper_id' });
User.hasMany(SavedPaper, { foreignKey: 'user_id' });

module.exports = SavedPaper;
