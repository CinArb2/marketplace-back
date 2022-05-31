const jwt = require('jsonwebtoken')
require('dotenv').config()

// Models
const { Shop } = require('../models/shop.model')

const { AppError } = require('../utils/appError')
const { catchAsync } = require('../utils/catchAsync')

const shopExist = catchAsync(async (req, res, next) => {
  const { id } = req.params
  
  const shop = await Shop.findOne({
    where: { id, status: 'active' }
  })

  if (!shop) {
    return next(new AppError('Shop does not exist with given Id', 404))
  }

  req.shop = shop
  next()
})

const protectShopOwner = catchAsync(async (req, res, next) => {
  const { userSession, shop } = req

  if (userSession.id !== shop.userId) {
    return next(new AppError('you are not authorized', 403))
  }

  next()
})

module.exports = {
  shopExist,
  protectShopOwner
}
