const { db } = require('../utils/db')
const { DataTypes } = require('sequelize')

const Shop = db.define('shop', {
  id: {
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  logoImg: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coverImg: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  }
})

module.exports = { Shop }