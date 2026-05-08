const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false
  },
  icon: { type: DataTypes.STRING, defaultValue: '💰' },
  color: { type: DataTypes.STRING, defaultValue: '#6366f1' },
  isSystem: { type: DataTypes.BOOLEAN, defaultValue: false }, //Es para diferenciar si es ya creada o la creo el usuario
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'Users', key: 'id' }
  }
});

module.exports = Category;
