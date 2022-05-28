const { db } = require('../utils/db')
const { DataTypes } = require('sequelize')

const ProductImg = db.define('productImg', {
  id: {
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
    allowNull: false
  },
  imgUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  }
})

module.exports = { ProductImg }