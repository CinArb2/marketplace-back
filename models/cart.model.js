const { db } = require('../utils/db')
const { DataTypes } = require('sequelize')

const Cart = db.define('cart', {
  id: {
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  }
})

module.exports = { Cart }
