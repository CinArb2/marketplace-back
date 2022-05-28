
require('dotenv').config()

const { Cart } = require('../models/cart.model')
const { Order } = require('../models/order.model')
const { ProductInCart } = require('../models/productInCart.model')
const { Product } = require('../models/product.model')

const { catchAsync } = require('../utils/catchAsync')
const { AppError } = require('../utils/appError')



const addProductCart = catchAsync(async (req, res, next) => {
  const { product, userSession } = req
  let { cart } = req
  const { quantity } = req.body

  // if cart doesnt exist, create it
  if (!cart) {
    cart = await Cart.create(
    {
      userId: userSession.id,
    })
  }

  // check if product already exists in cart
  let productCart = await ProductInCart.findOne({
    where: {
      productId: product.id,
      cartId: cart.id
    }
  })

  //product exists with status active in cart
  if (productCart && productCart.status === 'active') {
    return next(new AppError('Product already in cart', 404))
  }

  //product exists with status removed in cart
  if (productCart &&  productCart.status === 'removed') {
    await productCart.update({
      status: 'active',
      quantity 
    })
  }

  //product doesnt exist in cart so I added
  if (!productCart) {
    productCart = await ProductInCart.create(
    {
      cartId: cart.id,
      productId: product.id,
      quantity
    })
  } 

  res.status(200).json({
    productCart
  })

})



const updateCart = catchAsync(async (req, res, next) => {
  //buscar cart del usuario con token
  const { cart } = req

  if (!cart) {
    return next(new AppError('There is not cart active', 404))
  }

  //info que traje de validar cantidades
  const { quantity } = req.body
  const { product } = req

  let productCart = await ProductInCart.findOne({
    where: {
      productId: product.id,
      cartId: cart.id
    }
  })

  if (productCart && quantity === 0) {
    await productCart.update({
      status: 'removed',
      quantity
    })
  }

  if (productCart && quantity > 0) {
    await productCart.update({
      status: 'active',
      quantity
    })
  }

  if (!productCart && quantity !== 0) {
    return next(new AppError('Product not found in cart', 404))
  }

  res.status(200).json({ status: 'success' })
})

const deleteProductCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params

  //buscar cart del usuario con token
  const { cart } = req

  if (!cart) {
    return next(new AppError('There is not cart active', 404))
  }

  //encontrar productos en ese carrito
  let productCart = await ProductInCart.findOne({
    where: {
      productId,
      cartId: cart.id,
      status: 'active'
    }
  })

  if (!productCart) {
    return next(new AppError('Product not in cart', 404))
  }

  await productCart.update({ status: 'removed' })

  res.status(200).json({ status: 'success' })
})

const purchaseCart = catchAsync(async (req, res, next) => {
  let totalPrice = 0
  const { userSession, cart } = req

  if (!cart) {
    return next(new AppError('There is not cart active', 404))
  }

  const productCart = await ProductInCart.findAll({
    where: {
      cartId: cart.id,
      status: 'active'
    }
  })
  
  if (productCart.length === 0) {
    return next(new AppError('not products in cart', 404))
  }

  const promiseArray = productCart.map( async (el) => {

    const product = await Product.findOne({
      where: {
        id: el.productId,
      }
    })
    
    totalPrice += product.price * el.quantity
    
    await product.decrement('quantity', { by: el.quantity });

    await el.update({
      status: 'purchased',
    })
  })

  await Promise.all(promiseArray )
  
  await cart.update({
      status: 'purchased',
  })

  const newOrder = await Order.create({
      userId: userSession.id,
      cartId: cart.id,
      totalPrice
  })
  
  res.status(200).json({newOrder})
})

//estas son rutas para hacer test 
const getProductsInCart = catchAsync(async (req, res, next) => {
  let productInCArt = await ProductInCart.findAll()

  res.status(200).json({
    productInCArt
  })
})

const getCart = catchAsync(async (req, res, next) => {
  const { userSession } = req

  let cart = await Cart.findOne({
    where: { userId: userSession.id, status: 'active' }
  })

  res.status(200).json({
    cart
  })
})

module.exports = {
  getCart,
  addProductCart,
  purchaseCart,
  updateCart,
  deleteProductCart,
  getProductsInCart
}