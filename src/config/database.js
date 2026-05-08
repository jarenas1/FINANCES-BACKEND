const { Sequelize } = require('sequelize');

const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      dialect,
      logging: false,
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    }
  );

module.exports = sequelize;
