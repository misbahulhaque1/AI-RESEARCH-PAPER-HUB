const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');
    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error);
    throw error;
  }
};

module.exports = { sequelize, connectMySQL };
