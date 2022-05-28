require('dotenv').config()

const { Cart } = require('../models/cart.model')
const { Product } = require('../models/product.model')


const { AppError } = require('../utils/appError')
const { catchAsync } = require('../utils/catchAsync')

const cartActiveExist = catchAsync(async (req, res, next) => {
  const { userSession } = req

  let cart = await Cart.findOne({
    where: { userId: userSession.id, status: 'active' }
  })

  req.cart = cart
  next()
})

const validateQuantity = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body

  const product = await Product.findOne({
    where: { id: productId, status: 'active' }
  })

  if (!product) {
    return next(new AppError('Product not available', 404))
  }

  if (product.quantity < quantity) {
    return next(new AppError('We are sorry, we do not have enough products for your order.', 404))
  }

  req.product = product
  next()
})

module.exports = {
  cartActiveExist,
  validateQuantity
}